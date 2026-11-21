import { api, getCacheSession } from "../api/api";

const profileFields = ["fullName", "email", "phone", "city", "country", "rememberMe", "image"];

export async function handleUpdateProfile(profile, { dispatch, queryFulfilled, getState }) {
  const session = getCacheSession(getState);
  const patch = dispatch(
    api.util.updateQueryData("getProfile", undefined, (draft) => {
      if (!draft?.data) return;
      for (const field of profileFields) {
        if (Object.hasOwn(profile || {}, field)) draft.data[field] = profile[field];
      }
    }),
  );
  try {
    const { data: response } = await queryFulfilled;
    if (getCacheSession(getState) !== session) return;
    dispatch(api.util.updateQueryData("getProfile", undefined, (draft) => {
      if (!draft?.data || draft.data._id !== response?.data?._id) return;
      for (const field of profileFields) {
        if (Object.hasOwn(response.data, field)) draft.data[field] = response.data[field];
      }
    }));
  } catch {
    if (getCacheSession(getState) === session) patch.undo();
  }
}
