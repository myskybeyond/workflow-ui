export interface CategoryInfoVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 分类;标准  01：跟踪 02:固定 03：电气 04：车棚
非标  11：跟踪 12:固定 13：电气 14：车棚
项目资料 90：项目文件类别
   */
  category: string;

  /**
   * 父ID
   */
  parentId: string | number;

  /**
   * 分类名称
   */
  name: string;

  /**
   * 分类编码
   */
  code: string;

  /**
   * 排序;数值越大，排序越靠前
   */
  sort: number;

  /**
   * 备注;0:未读 1:已读
   */
  remark: string;

    /**
     * 子对象
     */
    children: CategoryInfoVO[];
}

export interface CategoryInfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 分类;标准  01：跟踪 02:固定 03：电气 04：车棚
非标  11：跟踪 12:固定 13：电气 14：车棚
项目资料 90：项目文件类别
   */
  category?:  string | number | undefined;

  /**
   * 父ID
   */
  parentId?: string | number;

  /**
   * 分类名称
   */
  name?: string;

  /**
   * 分类编码
   */
  code?: string;

  /**
   * 排序;数值越大，排序越靠前
   */
  sort?: number;

  /**
   * 备注;0:未读 1:已读
   */
  remark?: string;

}

export interface CategoryInfoQuery {

  /**
   * 分类;标准  01：跟踪 02:固定 03：电气 04：车棚
非标  11：跟踪 12:固定 13：电气 14：车棚
项目资料 90：项目文件类别
   */
  category?: string | number | undefined;

  /**
   * 分类名称
   */
  name?: string;

  /**
   * 分类编码
   */
  code?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}



