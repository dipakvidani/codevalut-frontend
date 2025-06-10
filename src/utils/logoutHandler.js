export const logoutUser = async () => {
  // When called from the Axios interceptor (e.g., on 401 Unauthorized),
  // the session is already considered invalid on the server-side or token expired.
  // No need to make another API call here, just clear client state and redirect.
  console.log("Automatically logging out due to unauthorized access or token expiry.");
  // In a real app, you might also clear localStorage items if tokens were stored there.
  window.location.href = "/login"; // Redirect to login page
};
  