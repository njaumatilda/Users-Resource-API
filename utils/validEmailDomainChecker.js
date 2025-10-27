import dns from "dns/promises"

const isValidEmailDomain = async (email) => {
  try {
    // something@something.something
    const domain = email.split("@")[1]
    const isInDnsRecords = await dns.resolveMx(domain)
    // check if domain exists in the DNS records AND can receive emails eg.
    // gmail.com / yahoo.com etc
    // the domain might exist in the records eg. something@example.com
    // but it's not for receiving emails
    if (isInDnsRecords && isInDnsRecords.length > 0) {
      console.log(isInDnsRecords)

      return isInDnsRecords && isInDnsRecords.length
    }
  } catch (error) {
    console.log(error)
  }
}

export default isValidEmailDomain
