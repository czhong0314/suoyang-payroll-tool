// Only confirmed rules are added; existing rule IDs remain unchanged.
RULES.push(
 {id:'old-hanyi-project',version:'老汉艺版本',group:'老汉艺',item:'项目绩效（不计发）',tier:'通用',rate:0,unit:'项目',note:'老汉艺版本没有项目绩效，小项目 / 创意项目同属项目。'},
 {id:'old-hanyi-base',version:'老汉艺版本',group:'老汉艺',item:'基础课绩效（不计发）',tier:'通用',rate:0,unit:'小时',note:'老汉艺版本没有基础课绩效。'},
 {id:'old-hanyi-referral',version:'老汉艺版本',group:'转介绍',item:'自产转介绍',tier:'通用',rate:.03,unit:'签约金额',note:'所有版本统一：签约金额3%，每名学生最高3000元。'}
);

// Confirmed old-Hanyi signing bonuses; paid in full is required by calculate().
for(const [key,item,rate,note] of [
 ['hours-200','课时制辅助签约（10课时以上至20课时）',200,'报名课时 >10 且 ≤20；按报名课时判断，不用实际授课小时。'],
 ['hours-500','课时制辅助签约（超过20课时）',500,'报名课时 >20。'],
 ['projects-200','项目制辅助签约（2个项目）',200,'报名2个项目。'],
 ['projects-500','项目制辅助签约（3个项目）',500,'报名3个项目。'],
 ['unlimited-800','不计课时制 / VIP3、VIP5、VIP8辅助签约',800,'不计课时制及Top3/5/8（VIP3/5/8）。'],
 ['portfolio-800','单作品集辅助签约',800,'学生报名单作品集，核发800元；须已全款，多位老师按各自版本标准均分。'],
 ['vip1-1200','高阶VIP1辅助签约',1200,'高阶VIP1辅助签约成功。']
])RULES.push({id:'old-hanyi-signup-'+key,version:'老汉艺版本',group:'签约激励',item,tier:'通用',rate,unit:'人',note});
