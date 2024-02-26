export const refresh = async () => {
  try {
    const response = await fetch("/api/refresh", {
      method: "POST",
    });
    const json = await response.json();
    return json;
  } catch (err) {
    console.error(err);
  }
};

const handleAuthenticate = async (message: any) => {
  switch (message) {
    case "Authorized":
      await refresh();
      return true;
    case "Authorization error":
      const auth = await refresh();
      if (auth.message === "Authorization error") {
        return false;
      }
      return true;
    default:
      console.error("An unexpected error has occurred");
      break;
  }
};

export const authenticate = async () => {
  try {
    const response = await fetch("/api/authenticate");
    const json = await response.json();
    const authenticated = await handleAuthenticate(json.message);
    return authenticated;
  } catch (err) {
    console.error(err);
  }
};
