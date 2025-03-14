import { UserVO } from '@/api/system/user/types';
import { userOptions } from '@/api/system/user';

const userSelectOptions = ref<UserVO[]>();
const getUserNameById = (userId: string | number) => {
  const user = userSelectOptions.value?.find((u) => u.userId === userId);
  if (user) {
    return user.nickName;
  } else {
    return userId;
  }
};

const getUserOptions = async () => {
  const res = await userOptions();
  if (res && res.data) {
    userSelectOptions.value = res.data;
  }
};
(async () => {
  await getUserOptions();
})();
export { getUserNameById };
