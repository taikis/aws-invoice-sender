const props = PropertiesService.getScriptProperties(); 
const month = new Date().getMonth() + 1 - 1; // 前の月の請求書を取得する

function createAndSendMail(invoicePDF) {
    const TEMPLATE_ID = props.getProperty("TEMPLATE_ID")
    if (TEMPLATE_ID == null) {
        throw new Error("TEMPLATE_IDが設定されていません");
    }
    var template = DocumentApp.openById(TEMPLATE_ID).getBody().getText();

	const bossMailAddress = props.getProperty("BOSS_MAIL_ADDRESS");
    if (bossMailAddress == null) {
        throw new Error("BOSS_MAIL_ADDRESSが設定されていません");
    }
	const toBossMailTitle = month + "月分のAWS請求書送付";
    const toBossMailBody = template.replace("{{month}}", month.toString());

    GmailApp.sendEmail(bossMailAddress, toBossMailTitle, toBossMailBody, {
        attachments: [invoicePDF],
    });
}

function getInvoicePDF() {
	var awsMailAddress = "no-reply-aws@amazon.com";
    const AWS_ACCOUNT_ID = props.getProperty("AWS_ACCOUNT_ID");
    if (AWS_ACCOUNT_ID == null) {
        throw new Error("AWS_ACCOUNT_IDが設定されていません");
    }
	var invoiceMailTitle =
		"Amazon Web Services Invoice Available [Account:" +
		AWS_ACCOUNT_ID +
		"]";
    var invoiceMailThreads = GmailApp.search(
        "from:" + awsMailAddress + " subject:" + invoiceMailTitle + "newer_than:1m"
    );
    if (invoiceMailThreads.length == 0) {
        throw new Error("請求書メールが見つかりませんでした");
    } 
    var invoiceMail = invoiceMailThreads[0].getMessages()[0];
    return invoiceMail.getAttachments()[0];
}

function main() {
    var invoicePDF = getInvoicePDF();
    createAndSendMail(invoicePDF);
}