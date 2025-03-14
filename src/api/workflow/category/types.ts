export interface CategoryVO {
  /**
   * 流程分类id
   */
  categoryId: string | number;

  /**
   * 流程分类名称
   */
  categoryName: string;

  /**
   * 分类编码
   */
  code: string;

  /**
   * 备注
   */
  remark: string;
  /**
   * 排序
   */
  sort: number;
  /**
   * 父id
   */
  categoryPid: string | number;
  children: CategoryVO[];
}

export interface CategoryForm extends BaseEntity {
  /**
   * 流程分类id
   */
  categoryId?: string | number;

  /**
   * 流程分类名称
   */
  categoryName?: string;

  /**
   * 分类编码
   */
  code?: string;

  /**
   * 备注
   */
  remark?: string;
  /**
   * 排序
   */
  sort?: number;
  /**
   * 父id
   */
  categoryPid?: string | number;
}

export interface CategoryQuery extends PageQuery {
  /**
   * 流程分类名称
   */
  categoryName?: string;

  /**
   * 分类编码
   */
  code?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

export interface DataGroupByCategoryVo {
  code?: string;
  total?: number;
}
