using ClinicAppointments.Api.Specifications;
using static ClinicAppointments.Api.Specifications.PasswordSpecifications;

namespace ClinicAppointments.Tests.UnitTests;

public class PasswordSpecificationsTests
{
    [Fact]
    public void Test_PasswordSpecifications_Fact()
    {
        string[] candidates = ["some", "something", "Something", "S0mething", "S0meth!ng"];
        (PasswordPolicy, int)[] tests = [
            (NoConstraint, 5),
            (AtLeast(8), 4),
            (AtLeast(8).And(ContainsUpperLetter), 3),
            (AtLeast(8).And(ContainsUpperLetter).And(ContainsDigit), 2),
            (AtLeast(8).And(ContainsUpperLetter).And(ContainsDigit).And(ContainsAny("!@#$%^&*".ToCharArray())), 1),
        ];

        foreach (var (policy, expected) in tests)
        {
            var result = candidates.Where(policy.Invoke).Count();
            Assert.Equal(expected, result);
        }
    }

    public static IEnumerable<object[]> GetPasswordPolicies()
    {
        yield return new object[] { NoConstraint, 5 };
        yield return new object[] { AtLeast(8), 4 };
        yield return new object[] { AtLeast(8).And(ContainsUpperLetter), 3 };
        yield return new object[] { AtLeast(8).And(ContainsUpperLetter).And(ContainsDigit), 2 };
        yield return new object[] { AtLeast(8).And(ContainsUpperLetter).And(ContainsDigit).And(ContainsAny("!@#$%^&*".ToCharArray())), 1 };
    }

    [Theory]
    [MemberData(nameof(GetPasswordPolicies))]
    public void Test_PasswordSpecifications_Theory(PasswordPolicy policy, int expected)
    {
        string[] candidates = { "some", "something", "Something", "S0mething", "S0meth!ng" };
        var result = candidates.Where(policy.Invoke).Count();
        Assert.Equal(expected, result);
    }
}
