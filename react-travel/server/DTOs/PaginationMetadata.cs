namespace Travel.Api.DTOs;

public record PaginationMetadata(int CurrentPage, int PageSize, int TotalCount, int TotalPages);
