export function listenApp(app, port) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`[api] 서버 가동: http://localhost:${port}`);
      resolve(server);
    });
  });
}
