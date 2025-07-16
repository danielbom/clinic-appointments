namespace ClinicAppointments.Api.Validations;

static class ValidateCnpj
{
    private static readonly string[] BLACKLIST = [
        "00000000000000",
        "11111111111111",
        "22222222222222",
        "33333333333333",
        "44444444444444",
        "55555555555555",
        "66666666666666",
        "77777777777777",
        "88888888888888",
        "99999999999999",
    ];

    public static bool IsCnpjValid(string cnpj)
    {
        if (cnpj.Length != 14) return false;
        if (!cnpj.All(char.IsDigit)) return false;
        if (BLACKLIST.Contains(cnpj)) return false;

        int a0 = cnpj[0] - '0';
        int a1 = cnpj[1] - '0';
        int a2 = cnpj[2] - '0';
        int a3 = cnpj[3] - '0';
        int a4 = cnpj[4] - '0';
        int a5 = cnpj[5] - '0';
        int a6 = cnpj[6] - '0';
        int a7 = cnpj[7] - '0';
        int a8 = cnpj[8] - '0';
        int a9 = cnpj[9] - '0';
        int a10 = cnpj[10] - '0';
        int a11 = cnpj[11] - '0';
        int a12 = cnpj[12] - '0';
        int a13 = cnpj[13] - '0';
        int sum12 = a0*5 + a1*4 + a2*3 + a3*2 + a4*9 + a5*8 + a6*7 + a7*6 + a8*5 + a9*4 + a10*3 + a11*2;
        int sum13 = a0*6 + a1*5 + a2*4 + a3*3 + a4*2 + a5*9 + a6*8 + a7*7 + a8*6 + a9*5 + a10*4 + a11*3 + a12*2;
        return ((sum12*10)%11)%10 == a12 && ((sum13*10)%11)%10 == a13;
    }
}
