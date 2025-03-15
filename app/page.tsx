"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, Square, Camera } from "lucide-react"

export default function ObjectDetection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [objectCounts, setObjectCounts] = useState<Record<string, number>>({})
  const [currentFrame, setCurrentFrame] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  const connectWebSocket = () => {
    setIsLoading(true)

    // Use the appropriate WebSocket URL based on your setup
    // For local development, it might be something like:
    const wsUrl = "http://127.0.0.1:8000"

    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      setIsConnected(true)
      setIsLoading(false)
      socketRef.current = socket
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCurrentFrame(data.frame)
      setObjectCounts(data.object_count)
    }

    socket.onerror = (error) => {
      console.error("WebSocket error:", error)
      setIsLoading(false)
    }

    socket.onclose = () => {
      setIsConnected(false)
      socketRef.current = null
    }
  }

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
      setIsConnected(false)
    }
  }

  // Clean up WebSocket connection when component unmounts
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Real-Time Object Detection</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative bg-black aspect-video flex items-center justify-center">
              {currentFrame ? (
                <img
                  src={`data:image/jpeg;base64,${currentFrame}`}
                  alt="Video stream"
                  className="max-h-full max-w-full"
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Camera size={48} className="mb-2" />
                  <p>No video stream available</p>
                </div>
              )}
            </div>

            <div className="p-4 flex justify-between items-center">
              <div>
                <Badge variant={isConnected ? "success" : "destructive"} className="mb-2">
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? "Receiving real-time object detection stream" : "Connect to start object detection"}
                </p>
              </div>

              <div>
                {isConnected ? (
                  <Button variant="destructive" onClick={disconnectWebSocket} className="flex items-center gap-2">
                    <Square size={16} />
                    Stop Stream
                  </Button>
                ) : (
                  <Button onClick={connectWebSocket} disabled={isLoading} className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Start Stream
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Object Counts</h2>

              {Object.keys(objectCounts).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(objectCounts).map(([className, count]) => (
                    <div key={className} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {className}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">{count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No objects detected</p>
                  <p className="text-sm mt-2">
                    {isConnected ? "Waiting for detections..." : "Connect to start detecting objects"}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="mt-6">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Detection Info</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-medium">YOLOv12x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${isConnected ? "text-green-500" : "text-red-500"}`}>
                    {isConnected ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span className="font-medium">Webcam</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

