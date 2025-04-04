import nodemailer from "nodemailer";

export const nodemailerTransport = (
  host: string,
  port: number,
  email: string,
  password: string
) => {
  return nodemailer.createTransport({
    host,
    port,
    secure: false, // Using TLS
    auth: {
      user: email,
      pass: password,
    },
    connectionTimeout: 10000,
  });
};
