namespace ClinicAppointments.Api.Specifications;

// https://www.youtube.com/watch?v=2UNAMhhh6n0
public static class PasswordSpecifications
{
    public delegate bool PasswordPolicy(string input);

    public static PasswordPolicy All(this PasswordPolicy[] policies) => policies switch
    {
        [] => NoConstraint,
        [var single] => single,
        [var head, .. var tail] => head.And(tail.All()),
    };

    public static PasswordPolicy NoConstraint => _ => true;

    public static PasswordPolicy And(this PasswordPolicy left, PasswordPolicy right) =>
        input => left(input) && right(input);
    
    public static PasswordPolicy AtLeast(int length) => input => input.Length >= length;
    public static PasswordPolicy ContainsUpperLetter => input => input.Any(char.IsUpper);
    public static PasswordPolicy ContainsLowerLetter => input => input.Any(char.IsLower);
    public static PasswordPolicy ContainsDigit => input => input.Any(char.IsDigit);
    public static PasswordPolicy ContainsAny(char[] characters) => input => input.Any(characters.Contains);
}