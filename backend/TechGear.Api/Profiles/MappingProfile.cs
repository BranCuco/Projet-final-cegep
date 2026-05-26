using AutoMapper;
using TechGear.Api.Dtos.Products;
using TechGear.Api.Models;

namespace TechGear.Api.Profiles;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Product, ProductResponseDto>();
        CreateMap<ProductRequestDto, Product>();
    }
}