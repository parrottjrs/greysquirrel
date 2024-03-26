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
      return false;
  }
};

export const authenticate = async () => {
  try {
    const response = await fetch("/api/authenticate");
    const { message, userId } = await response.json();
    const authenticated = await handleAuthenticate(message);
    return { success: authenticated, userId: userId };
  } catch (err) {
    console.error(err);
    return { success: false, userId: null };
  }
};

export const clipText = (text: any, type: string) => {
  let maxLength = 0;
  let maxWords = 0;
  switch (type) {
    case "title":
      maxLength = 20;
      maxWords = 4;
      break;
    case "content":
      maxLength = 150;
      maxWords = 35;
      break;
    default:
      break;
  }
  if (text.length <= maxLength) {
    return text;
  }
  const split = text.split(" ");
  const sliced = split.slice(0, maxWords);
  const joined = sliced.join(" ");
  return joined + "...";
};

export const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = new Date(date).toLocaleDateString([], options);
  return formattedDate;
};
