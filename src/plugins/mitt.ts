import mitt from 'mitt';

export default defineNuxtPlugin(() => {
  const emitter = mitt();

  return {
    provide: {
      activeModalsBus: {
        $on: emitter.on,
        $emit: emitter.emit,
      },
    },
  };
});