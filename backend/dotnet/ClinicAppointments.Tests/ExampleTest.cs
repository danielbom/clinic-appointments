namespace ClinicAppointments.Tests;

public class ExampleTest
{
    [Fact]
    public void Example() 
    {
        Assert.True(true);
    }

    [Fact(Skip = "Run only this test for debugging")]
    public void AnotherTest() 
    {
        Assert.True(false);
    }
}