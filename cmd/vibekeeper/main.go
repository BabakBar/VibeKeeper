package main //This file is the main program, not a shared library

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})
	r.Run(":8080")
}

/*r

//Think of r as your web server’s traffic cop.gin.Default() creates a router that knows how to handle incoming web traffic.

.GET("/ping", ...) means: “If someone visits the URL /ping, run this code.”
func(c *gin.Context) is a function (handler) that will run when the /ping route is accessed.
c.JSON(200, gin.H{"message": "pong"}) sends back a JSON response: { "message": "pong" } with HTTP status 200 (OK).
r.Run(":8080") Means: “Start listening for web requests on port 8080.”

*/
