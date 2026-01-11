/**
 * 发票表单数据
 */
export interface IInvoiceFormData {
  /** 发票类型：personal-个人，company-企业 */
  type: 'personal' | 'company'
  /** 发票抬头（个人姓名或企业名称） */
  title: string
  /** 纳税人识别号（企业必填） */
  taxNumber: string
  /** 发票内容 */
  content: string
  /** 接收邮箱 */
  email: string
}

