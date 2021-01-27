export default {
    fmtTime(val) {
        const dt = new Date(val);
        //年
        const y = dt.getFullYear();
        //月
        const m = (dt.getMonth() + 1 + '').padStart(2, '0');
        //日
        const d = (dt.getDate() + '').padStart(2, '0');
        //时
        const hh = (dt.getHours() + '').padStart(2, '0');
        //分
        const mm = (dt.getMinutes() + '').padStart(2, '0');
        //秒
        const ss = (dt.getSeconds() + '').padStart(2, '0');

        return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
    },
    fmtIsContainer(val) {
        return ['是', '否'][val]
    },
    // 帐号申请状态
    fmtIsAccountRecord(val) {

            return ['已同意', '已拒绝', '审核中'][val]
    },

    fmtDeployStatus(val) {
        return ['', '待审批', '已通过', '发布中', '发布成功', '发布失败', '已拒绝'][val]
    },
    // 工单状态
    fmtIsTicketRecord(val) {
        return ['已关闭', '处理中', '待处理', '已完成'][val]
    },
    // db申请记录状态
    fmtDbStatus(val) {
        return ['已同意', '已拒绝', '审核中'][val]
    }
}
