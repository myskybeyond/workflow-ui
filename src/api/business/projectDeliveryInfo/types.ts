export interface ProjectDeliveryInfoVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 项目ID
   */
  projectId: string | number;

  /**
   * 订单ID
   */
  orderId: string | number;

  /**
   * 名称
   */
  name: string;

  /**
   * 是否同步;0:未同步 1:已同步
   */
  isSync: number;

  /**
   * 项目文件信息表主键
   */
  projectFileId: string | number;

  /**
   * 创建人
   */
  createBy: number;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 更新人
   */
  updateBy: number;

  /**
   * 更新时间
   */
  updateTime: string;

}

export interface ProjectDeliveryInfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 项目ID
   */
  projectId?: string | number;

  /**
   * 订单ID
   */
  orderId?: string | number;

  /**
   * 名称
   */
  name?: string;

  /**
   * 是否同步;0:未同步 1:已同步
   */
  isSync?: number;

  /**
   * 项目文件信息表主键
   */
  projectFileId?: string | number;

}

export interface ProjectDeliveryInfoQuery extends PageQuery {

  /**
   * 项目ID
   */
  projectId?: string | number;

  /**
   * 订单ID
   */
  orderId?: string | number;

  /**
   * 名称
   */
  name?: string;

  /**
   * 是否同步;0:未同步 1:已同步
   */
  isSync?: number;

  /**
   * 项目文件信息表主键
   */
  projectFileId?: string | number;

  /**
   * 创建人
   */
  createBy?: number;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 更新人
   */
  updateBy?: number;

  /**
   * 更新时间
   */
  updateTime?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



