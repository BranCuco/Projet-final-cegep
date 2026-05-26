using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechGear.Api.Data;
using TechGear.Api.Dtos.Products;
using TechGear.Api.Models;

namespace TechGear.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    public ProductsController(ApplicationDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetAll()
    {
        var products = await _dbContext.Products
            .OrderBy(p => p.Name)
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<ProductResponseDto>>(products));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductResponseDto>> GetById(int id)
    {
        var product = await _dbContext.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        return Ok(_mapper.Map<ProductResponseDto>(product));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductResponseDto>> Create(ProductRequestDto request)
    {
        if (request.Price <= 0 || request.InventoryCount < 0)
        {
            return BadRequest("Price must be positive and inventory cannot be negative.");
        }

        var product = _mapper.Map<Product>(request);
        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync();

        var response = _mapper.Map<ProductResponseDto>(product);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductResponseDto>> Update(int id, ProductRequestDto request)
    {
        var product = await _dbContext.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.ImageUrl = request.ImageUrl;
        product.Price = request.Price;
        product.InventoryCount = request.InventoryCount;

        await _dbContext.SaveChangesAsync();

        return Ok(_mapper.Map<ProductResponseDto>(product));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _dbContext.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        _dbContext.Products.Remove(product);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }
}