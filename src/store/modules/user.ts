import { to } from 'await-to-js';
import defAva from '@/assets/images/profile.jpg';
import store from '@/store';
import { getToken, removeToken, setToken } from '@/utils/auth';
import { login as loginApi, logout as logoutApi, getInfo as getUserInfo } from '@/api/login';
import { LoginData } from '@/api/types';

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken());
  const name = ref('');
  const nickname = ref('');
  const userId = ref<string | number>('');
  const avatar = ref('');
  const roles = ref<Array<string>>([]); // 用户角色编码集合 → 判断路由权限
  const permissions = ref<Array<string>>([]); // 用户权限编码集合 → 判断按钮权限
  const posts = ref<string>(''); //用户岗位名称集合  →首页展示
  const forceResetPass = ref(false); //是否强制修改密码

  /**
   * 登录
   * @param userInfo
   * @returns
   */
  const login = async (userInfo: LoginData): Promise<void> => {
    const [err, res] = await to(loginApi(userInfo));
    if (res) {
      const data = res.data;
      setToken(data.access_token);
      token.value = data.access_token;
      return Promise.resolve();
    }
    return Promise.reject(err);
  };

  // 获取用户信息
  const getInfo = async (): Promise<void> => {
    const [err, res] = await to(getUserInfo());
    if (res) {
      const data = res.data;
      const user = data.user;
      const profile = user.avatar == '' || user.avatar == null ? defAva : user.avatar;

      if (data.roles && data.roles.length > 0) {
        // 验证返回的roles是否是一个非空数组
        roles.value = data.roles;
        permissions.value = data.permissions;
      } else {
        roles.value = ['ROLE_DEFAULT'];
      }
      name.value = user.userName;
      nickname.value = user.nickName;
      avatar.value = profile;
      userId.value = user.userId;
      posts.value = data.posts;
      forceResetPass.value = data.forceResetPass;
      return Promise.resolve();
    }
    return Promise.reject(err);
  };

  // 注销
  const logout = async (): Promise<void> => {
    await logoutApi();
    token.value = '';
    roles.value = [];
    permissions.value = [];
    removeToken();
    // 处理强制修改密码状态
    forceResetPass.value = false;
  };

  const setAvatar = (value: string) => {
    avatar.value = value;
  };

  return {
    userId,
    token,
    nickname,
    avatar,
    roles,
    posts,
    permissions,
    login,
    getInfo,
    logout,
    setAvatar,
    forceResetPass
  };
});

export default useUserStore;
// 非setup
export function useUserStoreHook() {
  return useUserStore(store);
}
