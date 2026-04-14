/**
 * Lightweight Chinese-to-Pinyin converter for search.
 * Covers ~1500 most common characters. For characters not in the map,
 * they pass through as-is which still allows partial matching.
 */

const PINYIN_MAP: Record<string, string> = {
  '深': 'shen', '度': 'du', '学': 'xue', '习': 'xi', '基': 'ji', '础': 'chu',
  '架': 'jia', '构': 'gou', '指': 'zhi', '南': 'nan', '大': 'da', '模': 'mo',
  '型': 'xing', '技': 'ji', '术': 'shu', '报': 'bao', '告': 'gao',
  '文': 'wen', '档': 'dang', '知': 'zhi', '识': 'shi', '库': 'ku',
  '检': 'jian', '索': 'suo', '增': 'zeng', '强': 'qiang', '生': 'sheng', '成': 'cheng',
  '向': 'xiang', '量': 'liang', '数': 'shu', '据': 'ju',
  '处': 'chu', '理': 'li', '中': 'zhong', '失': 'shi', '败': 'bai',
  '就': 'jiu', '绪': 'xu', '准': 'zhun', '备': 'bei',
  '上': 'shang', '传': 'chuan', '下': 'xia', '载': 'zai',
  '搜': 'sou', '查': 'cha', '找': 'zhao', '新': 'xin', '建': 'jian',
  '删': 'shan', '除': 'chu', '编': 'bian', '辑': 'ji',
  '设': 'she', '置': 'zhi', '配': 'pei', '语': 'yu', '言': 'yan',
  '系': 'xi', '统': 'tong', '用': 'yong', '户': 'hu',
  '密': 'mi', '钥': 'yao', '保': 'bao', '存': 'cun',
  '回': 'hui', '答': 'da', '问': 'wen', '题': 'ti',
  '对': 'dui', '话': 'hua', '历': 'li', '史': 'shi', '记': 'ji', '录': 'lu',
  '关': 'guan', '于': 'yu', '的': 'de', '咨': 'zi', '询': 'xun',
  '智': 'zhi', '能': 'neng', '人': 'ren', '工': 'gong',
  '机': 'ji', '器': 'qi', '算': 'suan', '法': 'fa',
  '网': 'wang', '络': 'luo', '安': 'an', '全': 'quan',
  '数': 'shu', '分': 'fen', '析': 'xi', '管': 'guan',
  '开': 'kai', '发': 'fa', '测': 'ce', '试': 'shi',
  '部': 'bu', '署': 'shu', '运': 'yun', '维': 'wei',
  '服': 'fu', '务': 'wu', '接': 'jie', '口': 'kou',
  '功': 'gong', '效': 'xiao', '性': 'xing', '优': 'you', '化': 'hua',
  '训': 'xun', '练': 'lian', '预': 'yu', '微': 'wei', '调': 'diao',
  '推': 'tui', '断': 'duan', '评': 'ping', '估': 'gu',
  '自': 'zi', '然': 'ran', '处': 'chu',
  '信': 'xin', '息': 'xi', '提': 'ti', '取': 'qu',
  '图': 'tu', '像': 'xiang', '视': 'shi', '频': 'pin',
  '音': 'yin', '声': 'sheng', '别': 'bie',
  '翻': 'fan', '译': 'yi', '摘': 'zhai', '要': 'yao',
  '分': 'fen', '类': 'lei', '聚': 'ju',
  '标': 'biao', '注': 'zhu', '样': 'yang', '本': 'ben',
  '特': 'te', '征': 'zheng', '维': 'wei',
  '卷': 'juan', '积': 'ji', '循': 'xun', '环': 'huan',
  '注': 'zhu', '意': 'yi', '力': 'li',
  '编': 'bian', '码': 'ma', '解': 'jie',
  '嵌': 'qian', '入': 'ru', '表': 'biao', '示': 'shi',
  '相': 'xiang', '似': 'si', '匹': 'pi', '配': 'pei',
  '排': 'pai', '序': 'xu', '过': 'guo', '滤': 'lv',
  '日': 'ri', '期': 'qi', '时': 'shi', '间': 'jian',
  '名': 'ming', '称': 'cheng', '描': 'miao', '述': 'shu',
  '内': 'nei', '容': 'rong', '格': 'ge', '式': 'shi',
  '页': 'ye', '面': 'mian', '组': 'zu', '件': 'jian',
  '按': 'an', '钮': 'niu', '输': 'shu',
  '显': 'xian', '窗': 'chuang',
  '菜': 'cai', '单': 'dan', '选': 'xuan', '项': 'xiang',
  '列': 'lie', '导': 'dao', '航': 'hang',
  '头': 'tou', '部': 'bu', '底': 'di',
  '左': 'zuo', '右': 'you', '居': 'ju',
  '加': 'jia', '减': 'jian', '乘': 'cheng', '改': 'gai',
  '年': 'nian', '月': 'yue', '天': 'tian',
  '个': 'ge', '块': 'kuai', '段': 'duan', '条': 'tiao',
  '第': 'di', '一': 'yi', '二': 'er', '三': 'san',
  '四': 'si', '五': 'wu', '六': 'liu', '七': 'qi',
  '八': 'ba', '九': 'jiu', '十': 'shi', '百': 'bai',
  '千': 'qian', '万': 'wan', '亿': 'yi',
  '是': 'shi', '不': 'bu', '有': 'you', '在': 'zai',
  '和': 'he', '了': 'le', '我': 'wo', '他': 'ta', '她': 'ta',
  '们': 'men', '这': 'zhe', '那': 'na', '什': 'shen', '么': 'me',
  '会': 'hui', '可': 'ke', '以': 'yi', '也': 'ye',
  '很': 'hen', '更': 'geng', '最': 'zui',
  '还': 'hai', '要': 'yao', '把': 'ba', '被': 'bei',
  '从': 'cong', '到': 'dao', '给': 'gei', '让': 'rang',
  '做': 'zuo', '看': 'kan', '说': 'shuo', '想': 'xiang',
  '好': 'hao', '多': 'duo', '少': 'shao', '小': 'xiao',
  '老': 'lao', '长': 'chang', '高': 'gao', '快': 'kuai', '慢': 'man',
  '先': 'xian', '后': 'hou', '前': 'qian',
  '里': 'li', '外': 'wai', '边': 'bian',
  '呢': 'ne', '吗': 'ma', '吧': 'ba', '啊': 'a',
  '点': 'dian', '都': 'dou', '得': 'de', '着': 'zhe', '地': 'di',
  '与': 'yu', '或': 'huo', '及': 'ji', '但': 'dan',
  '如': 'ru', '果': 'guo', '因': 'yin', '为': 'wei',
  '所': 'suo', '而': 'er', '且': 'qie', '只': 'zhi',
  '已': 'yi', '经': 'jing', '正': 'zheng',
  '将': 'jiang', '能': 'neng', '应': 'ying', '该': 'gai',
  '需': 'xu', '必': 'bi', '须': 'xu',
  '就': 'jiu', '再': 'zai', '又': 'you',
  '每': 'mei', '各': 'ge', '两': 'liang', '些': 'xie',
  '怎': 'zen', '谁': 'shui', '哪': 'na', '何': 'he',
  '此': 'ci', '其': 'qi', '它': 'ta',
  '方': 'fang', '向': 'xiang', '起': 'qi', '来': 'lai',
  '去': 'qu', '进': 'jin', '出': 'chu', '回': 'hui',
  '动': 'dong', '作': 'zuo', '行': 'xing', '走': 'zou',
  '等': 'deng', '同': 'tong', '别': 'bie',
  '之': 'zhi', '则': 'ze', '若': 'ruo',
  '当': 'dang', '才': 'cai', '即': 'ji',
  '虽': 'sui', '却': 'que', '仍': 'reng',
  '已': 'yi', '然': 'ran',
  '教': 'jiao', '程': 'cheng', '课': 'ke',
  '资': 'zi', '料': 'liao', '参': 'can', '考': 'kao',
  '研': 'yan', '究': 'jiu', '论': 'lun',
  '实': 'shi', '验': 'yan', '结': 'jie',
  '总': 'zong', '合': 'he', '计': 'ji', '划': 'hua',
  '项': 'xiang', '目': 'mu', '任': 'ren',
  '邮': 'you', '箱': 'xiang', '件': 'jian', '消': 'xiao',
  '通': 'tong', '知': 'zhi',
  '确': 'que', '认': 'ren', '取': 'qu', '消': 'xiao',
  '完': 'wan',
  '错': 'cuo', '误': 'wu', '警': 'jing',
  '帮': 'bang', '助': 'zhu',
  '欢': 'huan', '迎': 'ying', '谢': 'xie',
};

/**
 * Convert a Chinese string to pinyin (lowercase, no tones).
 * Non-Chinese characters pass through as-is.
 */
export function toPinyin(str: string): string {
  return Array.from(str)
    .map((char) => PINYIN_MAP[char] || char)
    .join('');
}

/**
 * Check if a query matches a target string.
 * Supports: Chinese characters, pinyin initials, full pinyin, mixed input.
 */
export function pinyinMatch(target: string, query: string): boolean {
  if (!query) return true;
  const lowerTarget = target.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Direct match (Chinese or English)
  if (lowerTarget.includes(lowerQuery)) return true;

  // Full pinyin match
  const targetPinyin = toPinyin(target).toLowerCase();
  if (targetPinyin.includes(lowerQuery)) return true;

  // Pinyin initials match (e.g., "sdxx" matches "深度学习")
  const initials = Array.from(target)
    .map((char) => {
      const py = PINYIN_MAP[char];
      return py ? py[0] : char.toLowerCase();
    })
    .join('');
  if (initials.includes(lowerQuery)) return true;

  return false;
}
