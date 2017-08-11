/**
 * API 错误码
 */

// user
var errorinfo =  [
    { errorfrom: 'server', errorname: 'auth_emailpass_null', code: '10001', enmessage_from: '', cnmessage_from: '', message_trans: '邮箱地址或密码不能为空' },
    { errorfrom: 'server', errorname: 'auth_emailpass_error', code: '10002', enmessage_from: '', cnmessage_from: '', message_trans: '邮箱或密码错误' },
    { errorfrom: 'server', errorname: 'auth_name_exist', code: '10003', enmessage_from: '', cnmessage_from: '', message_trans: '用户名已存在' },
    { errorfrom: 'server', errorname: 'auth_name_noexist', code: '10004', enmessage_from: '', cnmessage_from: '', message_trans: '用户名不存在或已经删除' },
    { errorfrom: 'server', errorname: 'auth_name_islucked', code: '10005', enmessage_from: '', cnmessage_from: '', message_trans: '账号已被锁定，请稍后重新尝试' },
    { errorfrom: 'server', errorname: 'auth_email_null', code: '10006', enmessage_from: '', cnmessage_from: '', message_trans: '邮箱地址不能为空' },
    { errorfrom: 'server', errorname: 'auth_user_noexist', code: '10007', enmessage_from: '', cnmessage_from: '', message_trans: '用户不存在或邮箱地址不正确' },
    { errorfrom: 'server', errorname: 'auth_cookie_unsign', code: '10008', enmessage_from: '', cnmessage_from: '', message_trans: 'cookie签名验证失败' },
    { errorfrom: 'server', errorname: 'auth_session_noexist', code: '10009', enmessage_from: '', cnmessage_from: '', message_trans: 'session已经失效或不存在' },
    { errorfrom: 'server', errorname: 'auth_token_noexist', code: '10010', enmessage_from: '', cnmessage_from: '', message_trans: 'token已经失效或不存在' },
    { errorfrom: 'server', errorname: 'auth_email_activate_not', code: '10011', enmessage_from: '', cnmessage_from: '', message_trans: '用户尚未邮件激活，请激活后重新尝试' },
    { errorfrom: 'server', errorname: 'auth_captcha_err', code: '10012', enmessage_from: '', cnmessage_from: '', message_trans: '请正确输入验证码' },
    { errorfrom: 'server', errorname: 'user_uid_Valid', code: '10101', enmessage_from: '', cnmessage_from: '', message_trans: '输入的UID不合法' },
    { errorfrom: 'server', errorname: 'user_params_null', code: '10102', enmessage_from: '', cnmessage_from: '', message_trans: '输入的参数不能为空' },
    { errorfrom: 'server', errorname: 'user_stringtoken_noexist', code: '10103', enmessage_from: '', cnmessage_from: '', message_trans: '验证码已经失效或错误' },
    { errorfrom: 'server', errorname: 'user_pass_null', code: '10104', enmessage_from: '', cnmessage_from: '', message_trans: '密码不能为空' },
    { errorfrom: 'server', errorname: 'user_session_null', code: '10105', enmessage_from: '', cnmessage_from: '', message_trans: 'session失效' },
    { errorfrom: 'server', errorname: 'data_model_null', code: '10201', enmessage_from: '', cnmessage_from: '', message_trans: '生成Model错误，请检查请求参数格式' },
    { errorfrom: 'server', errorname: 'data_find_position', code: '10202', enmessage_from: '', cnmessage_from: '', message_trans: 'find参数数据格式错误' },
    { errorfrom: 'server', errorname: 'data_Projection_err', code: '10203', enmessage_from: '', cnmessage_from: '', message_trans: '显示参数设置异常' }
]

exports.errorinfo

/**
 * 获取错误信息
 * @param code 错误码
*/
exports.getErrorMessage_code = function (code) {
    for (let value in this.errorinfo) {
        if (code == this.errorinfo[value].code) {
            return this.errorinfo[value].message_trans;
        }
    }
    return '';
}
/**
 * 获取错误码
 * @param errorname 错误名
*/
exports.getErrorCode_name = function (errorname) {
    for (let value in errorinfo) {
        if (errorname == errorinfo[value].errorname) {
            return errorinfo[value].code;
        }
    }
    return '';
}
/**
 * 获取错误信息
 * @param errorname 错误名
*/
exports.getErrorMessage_name = function (errorname) {
    for (let value in errorinfo) {
        if (errorname == errorinfo[value].errorname) {
            return errorinfo[value].message_trans;
        }
    }
    return '';
}