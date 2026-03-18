export function get_sigs_result(res) {
    if (res && res?.result) {
        return res.result;
    }
    return res;
}
