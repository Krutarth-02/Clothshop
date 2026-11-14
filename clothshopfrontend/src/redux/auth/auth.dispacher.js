import { api, getCacheSession } from "../api/api";

export const handleUpdateProfile = async (profile, toolkitApi) => {
  const { dispatch, queryFulfilled, getState } = toolkitApi;
  const session = getCacheSession(getState);
  const isCurrent = () => getCacheSession(getState) === session;
  const fields = ["fullName", "email", "phone", "city", "country", "rememberMe", "image"];
  const patches = [];
  let saved = false;
  for (const endpoint of ["getProfile"]) {
    if (!api.endpoints[endpoint]) continue;
    patches.push(dispatch(
      api.util.updateQueryData(endpoint, undefined, (draft) => {
        if (!draft?.data) return;
        for (const field of fields) {
          if (Object.hasOwn(profile || {}, field)) draft.data[field] = profile[field];
        }
      }),
    ));
  }

  try {
    const { data: response } = await queryFulfilled;
    saved = true;
    if (!isCurrent()) return;
    for (const endpoint of ["getProfile"]) {
      if (!api.endpoints[endpoint]) continue;
      dispatch(api.util.updateQueryData(endpoint, undefined, (draft) => {
        if (!draft?.data || draft.data._id !== response?.data?._id) return;
        for (const field of fields) {
          if (Object.hasOwn(response.data, field)) draft.data[field] = response.data[field];
        }
      }));
    }
  } catch {
    if (!saved && isCurrent()) for (const patch of patches.reverse()) patch.undo();
  }
};
