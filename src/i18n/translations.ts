export type Language = 'en' | 'zh';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.lookup': 'Lookup',
    'nav.sos': 'SOS',
    'nav.drill': 'Drill',
    'nav.talk': 'Talk',
    'nav.logout': 'Logout',

    // Auth Page
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.signupLink': "Don't have an account? Sign up",
    'auth.loginLink': 'Already have an account? Login',
    'auth.emailRequired': 'Email is required',
    'auth.passwordRequired': 'Password is required',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.signingUp': 'Creating account...',
    'auth.signingIn': 'Logging in...',
    'auth.error': 'Authentication failed',

    // Lookup Page
    'lookup.title': 'Dictionary',
    'lookup.search': 'Search word...',
    'lookup.noResults': 'No results found',
    'lookup.phonetic': 'Phonetic',
    'lookup.definition': 'Definition',
    'lookup.translation': 'Translation',
    'lookup.addToDrill': 'Add to Drill',
    'lookup.removeFromDrill': 'Remove from Drill',
    'lookup.example': 'Example',

    // SOS Page
    'sos.title': 'SOS',
    'sos.ask': 'Ask a question',
    'sos.send': 'Send',
    'sos.sending': 'Sending...',
    'sos.error': 'Failed to send message',
    'sos.placeholder': 'Ask anything in English...',

    // Drill Page
    'drill.title': 'Drill',
    'drill.noWords': 'No words to drill',
    'drill.addWords': 'Add words to drill first',
    'drill.answer': 'Your answer',
    'drill.submit': 'Submit',
    'drill.correct': 'Correct!',
    'drill.incorrect': 'Incorrect',
    'drill.score': 'Score',

    // Free Talk Page
    'talk.title': 'Free Talk',
    'talk.message': 'Message',
    'talk.send': 'Send',
    'talk.sending': 'Sending...',
    'talk.error': 'Failed to send message',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  },
  zh: {
    // Navigation
    'nav.lookup': '查词',
    'nav.sos': 'SOS',
    'nav.drill': '练习',
    'nav.talk': '对话',
    'nav.logout': '登出',

    // Auth Page
    'auth.login': '登录',
    'auth.signup': '注册',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.signupLink': '还没有账户？注册',
    'auth.loginLink': '已有账户？登录',
    'auth.emailRequired': '邮箱为必填项',
    'auth.passwordRequired': '密码为必填项',
    'auth.passwordMismatch': '两次输入的密码不一致',
    'auth.signingUp': '创建账户中...',
    'auth.signingIn': '登录中...',
    'auth.error': '认证失败',

    // Lookup Page
    'lookup.title': '词典',
    'lookup.search': '搜索单词...',
    'lookup.noResults': '未找到结果',
    'lookup.phonetic': '音标',
    'lookup.definition': '定义',
    'lookup.translation': '翻译',
    'lookup.addToDrill': '加入练习',
    'lookup.removeFromDrill': '移出练习',
    'lookup.example': '例句',

    // SOS Page
    'sos.title': 'SOS',
    'sos.ask': '提出问题',
    'sos.send': '发送',
    'sos.sending': '发送中...',
    'sos.error': '发送失败',
    'sos.placeholder': '用英文提问任何内容...',

    // Drill Page
    'drill.title': '练习',
    'drill.noWords': '没有单词可以练习',
    'drill.addWords': '请先添加单词到练习',
    'drill.answer': '你的答案',
    'drill.submit': '提交',
    'drill.correct': '正确!',
    'drill.incorrect': '错误',
    'drill.score': '得分',

    // Free Talk Page
    'talk.title': '自由对话',
    'talk.message': '消息',
    'talk.send': '发送',
    'talk.sending': '发送中...',
    'talk.error': '发送失败',

    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
  },
};
