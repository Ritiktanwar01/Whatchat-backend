export default function sendSMS(mobile, dateFrom, dateTo, paymentDate, amount, vehicleNo) {
  try {
    const api = `${process.env.SMS_API}`;
    const params = new URLSearchParams({
      apikey: `${process.env.SMS_API_KEY}`,
      username: `${process.env.SMS_API_USER}`,
      apirequest: "Text",
      format: "JSON",
      sender: "TVAHAN",
      route: "TRANS",
      mobile: mobile,
      TemplateID: "1207166903332799443",
      message: `Your Tax of Rs.${amount} has been paid for Vehicle No.${vehicleNo}, valid from ${dateFrom} to ${dateTo} paid on ${paymentDate} -TVAHAN`
    });

    return fetch(`${api}?${params.toString()}`)
      .then(response => response.json())
      .catch(error => {
        console.error("Something went wrong:", error);
        return 0;
      });
  } catch (err) {
    console.error("Unexpected error:", err);
    return 0;
  }
}
