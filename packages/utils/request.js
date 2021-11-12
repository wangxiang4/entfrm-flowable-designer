/**
 * @program: entfrm-flowable-designer
 *
 * @description: axios外部请求工具类
 *
 * 可以做一些加工外部axios处理
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-06-03
 **/
import globalConfig from '@/common/config/global'
import packages from './packages'
import lodash from 'lodash'

// axios实例,检查是否存在,不存在弹出提示
const service = lodash.isEmpty(globalConfig.axios) ? packages.logs('thirdPartyAxios') : globalConfig.axios

export default service
