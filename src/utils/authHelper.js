export const getUserDetails = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (!storedUser) return null;

  const user = storedUser.user || storedUser;

  return {
    uid: user.uid,
    email: user.umail || user.email,
    mobile: user.umob || user.mobile
  };
};