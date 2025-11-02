using System;
using Xunit;
using FluentAssertions;
using Wusul;
using Wusul.Models;

namespace Wusul.Tests
{
    public class WusulClientTests
    {
        [Fact]
        public void Constructor_WithValidCredentials_ShouldCreateClient()
        {
            // Arrange & Act
            var client = new WusulClient("test-account-id", "test-secret");

            // Assert
            client.Should().NotBeNull();
            client.AccessPasses.Should().NotBeNull();
            client.Console.Should().NotBeNull();
        }

        [Fact]
        public void Constructor_WithNullAccountId_ShouldThrowArgumentException()
        {
            // Arrange & Act
            Action act = () => new WusulClient(null!, "test-secret");

            // Assert
            act.Should().Throw<ArgumentException>()
                .WithMessage("*accountId*");
        }

        [Fact]
        public void Constructor_WithEmptyAccountId_ShouldThrowArgumentException()
        {
            // Arrange & Act
            Action act = () => new WusulClient("", "test-secret");

            // Assert
            act.Should().Throw<ArgumentException>()
                .WithMessage("*accountId*");
        }

        [Fact]
        public void Constructor_WithNullSharedSecret_ShouldThrowArgumentException()
        {
            // Arrange & Act
            Action act = () => new WusulClient("test-account-id", null!);

            // Assert
            act.Should().Throw<ArgumentException>()
                .WithMessage("*sharedSecret*");
        }

        [Fact]
        public void Constructor_WithEmptySharedSecret_ShouldThrowArgumentException()
        {
            // Arrange & Act
            Action act = () => new WusulClient("test-account-id", "");

            // Assert
            act.Should().Throw<ArgumentException>()
                .WithMessage("*sharedSecret*");
        }

        [Fact]
        public void Constructor_WithCustomConfig_ShouldCreateClient()
        {
            // Arrange
            var config = new WusulConfig
            {
                BaseUrl = "https://custom.api.wusul.io",
                Timeout = 60000
            };

            // Act
            var client = new WusulClient("test-account-id", "test-secret", config);

            // Assert
            client.Should().NotBeNull();
        }

        [Fact]
        public void Dispose_ShouldNotThrow()
        {
            // Arrange
            var client = new WusulClient("test-account-id", "test-secret");

            // Act
            Action act = () => client.Dispose();

            // Assert
            act.Should().NotThrow();
        }
    }
}
