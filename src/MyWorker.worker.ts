console.log("MyWorker loaded", self);

self.addEventListener("message", (event) => {
  console.group("MyWorker");
  console.log("MyWorker get message", event.data);

  const buffer = event.data as ArrayBuffer;

  const view = new Uint8Array(buffer);

  const vBefore = view[0];
  const vAfter = vBefore + 1;
  view[0] = vAfter;
  console.log("MyWorker view[0] before", vBefore);
  console.log("MyWorker view[0] after", vAfter);
  console.groupEnd();
  setTimeout(() => {
    // @ts-ignore
    postMessage(buffer, [buffer]);
  }, 200);
});
