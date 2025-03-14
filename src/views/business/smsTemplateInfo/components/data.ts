const data = [
  {
    id: 1,
    name: '项目',
    pid: 0,
    variable: '',
    prefix: 'project'
  },
  {
    id: 2,
    name: '项目名称',
    pid: 1,
    variable: 'name'
  },
  {
    id: 3,
    name: '项目编号',
    pid: 1,
    variable: 'projectNo'
  },
  {
    id: 4,
    name: '采购单位',
    pid: 1,
    variable: 'purchaseUnit'
  },
  {
    id: 5,
    name: '项目地点',
    pid: 1,
    variable: 'location'
  },
  {
    id: 6,
    name: '支架类型',
    pid: 1,
    variable: 'supportType'
  },
  {
    id: 7,
    name: '开始日期',
    pid: 1,
    variable: 'startTime'
  },
  {
    id: 8,
    name: '预计结束日期',
    pid: 1,
    variable: 'endTime'
  },
  {
    id: 100,
    name: '销售订单',
    pid: 0,
    variable: '',
    prefix: 'order'
  },
  {
    id: 101,
    name: '销售订单编号',
    pid: 100,
    variable: 'orderNo'
  },
  {
    id: 102,
    name: '销售订单名称',
    pid: 100,
    variable: 'name'
  },
  {
    id: 103,
    name: '项目地点',
    pid: 100,
    variable: 'location'
  },
  {
    id: 104,
    name: '联系人',
    pid: 100,
    variable: 'contactPerson'
  },
  {
    id: 105,
    name: '电话',
    pid: 100,
    variable: 'contactPhone'
  },
  {
    id: 106,
    name: '邮箱',
    pid: 100,
    variable: 'contactEmail'
  },
  {
    id: 107,
    name: 'DC总容量',
    pid: 100,
    variable: 'dc'
  },
  {
    id: 108,
    name: '开始日期',
    pid: 100,
    variable: 'startTime'
  },
  {
    id: 109,
    name: '预计结束日期',
    pid: 100,
    variable: 'endTime'
  },
  {
    id: 110,
    name: '进度',
    pid: 100,
    variable: 'progress'
  },
  {
    id: 200,
    name: '流程',
    pid: 0,
    variable: '',
    prefix: 'flow'
  },
  {
    id: 301,
    name: '流程名称',
    pid: 200,
    variable: 'procDefName'
  },
  {
    id: 302,
    name: '流程发起人',
    pid: 200,
    variable: 'initiator'
  },
  {
    id: 303,
    name: '节点名称',
    pid: 200,
    variable: 'procNodeName'
  },
  {
    id: 304,
    name: '节点处理人',
    pid: 200,
    variable: 'processor'
  },
  {
    id: 305,
    name: '节点接收时间',
    pid: 200,
    variable: 'receiveTime'
  },
  {
    id: 306,
    name: '节点完成时间',
    pid: 200,
    variable: 'completeTime'
  }
];

export default data;
