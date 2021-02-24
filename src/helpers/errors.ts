import * as _ from "lodash";

function parseJoiError(error: any) {
  // replace all variable names
  const splits = error.split('"');
  const variable = splits[1].trim();
  let message = splits[2].trim();

  switch (message) {
    case "is not allowed to be empty":
      message = "is required";
      break;
    case "must be a valid email":
      return "Invalid email address";
    case "with value":
      return `Invalid ${variable}`;
  }

  // console.log(error, variable, message);
  return `${_.startCase(variable)} ${message}`;
}

export function sendJoiValidationError(error: any) {
  const errors: { [field: string]: string } = {};
  const errorData = error.errors || error.details;
  for (let k = 0; k < errorData.length; k++) {
    const fieldData = errorData[k].field || errorData[k].path;
    const field = fieldData.join(".");
    const messageData = errorData[k].message || errorData[k].messages[0];
    const message = parseJoiError(messageData);
    errors[field] = message;
  }
  return errors;
}
