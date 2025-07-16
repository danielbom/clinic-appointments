namespace ClinicAppointments.Api.Validations;

static class ValidateCpf
{
    private static readonly string[] BLACKLIST = [
        "00000000000",
        "11111111111",
        "22222222222",
        "33333333333",
        "44444444444",
        "55555555555",
        "66666666666",
        "77777777777",
        "88888888888",
        "99999999999",
        "12345678909",
    ];

    public static bool IsCpfValid(string cpf)
    {
        if (cpf.Length != 11) return false;
        if (!cpf.All(char.IsDigit)) return false;
        if (BLACKLIST.Contains(cpf)) return false;

        int a0 = cpf[0] - '0';
        int a1 = cpf[1] - '0';
        int a2 = cpf[2] - '0';
        int a3 = cpf[3] - '0';
        int a4 = cpf[4] - '0';
        int a5 = cpf[5] - '0';
        int a6 = cpf[6] - '0';
        int a7 = cpf[7] - '0';
        int a8 = cpf[8] - '0';
        int a9 = cpf[9] - '0';
        int a10 = cpf[10] - '0';
        int sum9 = a0*10 + a1*9 + a2*8 + a3*7 + a4*6 + a5*5 + a6*4 + a7*3 + a8*2;
        int sum10 = a0*11 + a1*10 + a2*9 + a3*8 + a4*7 + a5*6 + a6*5 + a7*4 + a8*3 + a9*2;
        return ((sum9*10)%11)%10 == a9 && ((sum10*10)%11)%10 == a10;
    }
}
