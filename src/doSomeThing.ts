
export function doSomeThing() {
    const input = "```shaa22aadd    ";

    // 定义匹配语言标记的正则表达式
    const regex = /```([a-zA-Z0-9]+)\s*$/;
    const match = input.match(regex);

    if (match) {
        const language = match[1]; // 捕获到的语言标记
        console.log("语言标记:", language);
    } else {
        console.log("未匹配到语言标记");
    }
}