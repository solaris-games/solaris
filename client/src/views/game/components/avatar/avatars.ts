import type { Avatar } from "@solaris/common";

export const getAvatarImage = (avatar: Avatar | null) => {
  if (!avatar) {
    return undefined;
  }

  try {
    return new URL(`../../../../assets/avatars/${avatar.file}`, import.meta.url)
      .href;
  } catch (err) {
    console.error(err);

    return undefined;
  }
};

export const getAvatarWebpImage = (avatar: Avatar | null) => {
  if (!avatar) {
    return undefined;
  }

  if (["jpg", "png", "jpeg"].some((ext) => avatar.file.endsWith(ext))) {
    try {
      const base = avatar.file.replace(/\.[^.]+$/, "");
      return new URL(`../../../../assets/avatars/${base}.webp`, import.meta.url)
        .href;
    } catch (err) {
      console.error(err);

      return undefined;
    }
  }

  return undefined;
};
