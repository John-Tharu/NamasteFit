import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

//Instance of Resend
const resend = new Resend(process.env.RESEND_API_KEY);

//Sending the email to the user
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Namaste Fit <website@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      return console.error(error);
    } else {
      console.log(data);
    }
  } catch (error) {
    console.error("Internal server error");
  }
};
