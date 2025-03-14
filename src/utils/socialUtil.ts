import dingdinghangtai from '@/assets/images/dingding-hangtai.png';
import dingdinghangxin from '@/assets/images/dingding-hangxin.png';
import dingdingzhetai from '@/assets/images/dingding-zhetai.png';
import dingdingzhexin from '@/assets/images/dingding-zhexin.png';
import dingdinganshengte from '@/assets/images/dingding-anshengte.png';
import dingdingbeixin from '@/assets/images/dingding-beixin.png';
import others from '@/assets/images/dingding-others.png';

export const splitImgSrc = (appCode: string) => {
  if (appCode === 'DINGTALK-HANGTAI') {
    return dingdinghangtai;
  } else if (appCode === 'DINGTALK-HANGXIN') {
    return dingdinghangxin;
  } else if (appCode === 'DINGTALK-ZHEXIN') {
    return dingdingzhexin;
  } else if (appCode === 'DINGTALK-ZHETAI') {
    return dingdingzhetai;
  } else if (appCode === 'DINGTALK-ANSHENGTE') {
    return dingdinganshengte;
  } else if (appCode === 'DINGTALK-BEIXIN') {
    return dingdingbeixin;
  } else {
    return others;
  }
};

export const calcAbsoluteLeft = (index: number) => {
  return {
    'font-family': '黑体',
    'font-size': '12px',
    'font-weight': 600,
    position: 'absolute',
    color: 'white',
    left: index > 1 ? 10 + 'px' : 0,
    top: '2px'
  };
};
export const calcAbsoluteLeftOfThirdParty = (index: number) => {
  return {
    'font-family': '黑体',
    'font-size': '17px',
    'font-weight': 650,
    position: 'absolute',
    color: 'white',
    left: index > 1 ? 16 + 'px' : 0,
    top: '1px'
  };
};

export const othersShow = (appCode: string) => {
  return (
    appCode !== 'DINGTALK-HANGTAI' &&
    appCode !== 'DINGTALK-HANGXIN' &&
    appCode !== 'DINGTALK-ZHEXIN' &&
    appCode !== 'DINGTALK-ZHETAI' &&
    appCode !== 'DINGTALK-ANSHENGTE' &&
    appCode !== 'DINGTALK-BEIXIN'
  );
};
