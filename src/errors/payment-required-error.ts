import { ApplicationError } from "@/protocols";

export function preconditionFailedError(): ApplicationError {
  return {
    name: "preconditionFailed",
    message: "Precondition Failed",
  };
}
