/**
 * HTTP 서버 기동
 * @param {import("express").Express} app
 * @param {number} port
 * @returns {Promise<import("http").Server>}
 */
export function listenApp(app, port) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log("Server is running on port " + port);
      resolve(server);
    });
  });
}
