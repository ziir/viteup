import swc from "vite-plugin-swc-transform";

export default {
  plugins: [
    swc({
      swcOptions: {
        jsc: {
          target: "es2022",
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
            useDefineForClassFields: false,
          },
        },
      },
    }),
  ],
};
