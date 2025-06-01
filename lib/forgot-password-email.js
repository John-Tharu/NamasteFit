import mjml2html from "mjml";
import fs from "fs/promises";
import path from "path";
import ejs from "ejs";

export const getForgotPasswordLinkPage = async (template, data) => {
  //Getting the MJML file
  const emailTemplate = await fs.readFile(
    path.join(import.meta.dirname, "..", "emails", `${template}.mjml`),
    "utf-8"
  );

  //Replacing the placeholders(name,link) with actual data
  const filledTemplete = ejs.render(emailTemplate, data);

  //Converting MJML file to HTML
  const htmlOutput = mjml2html(filledTemplete).html;

  //Returning the htmlOutput
  return htmlOutput;
};
