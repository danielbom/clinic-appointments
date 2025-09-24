package usecase

import "backend/internal/domain"

type PaginationArgs struct {
	PageSize domain.Int
	Page     domain.Int
}

func PaginationArgsNew(page, pageSize int32) PaginationArgs {
	return PaginationArgs{
		Page:     domain.Int(page),
		PageSize: domain.Int(pageSize),
	}
}

func (args *PaginationArgs) Validate() *UsecaseError {
	if args.PageSize == 0 {
		args.PageSize = 10
	}

	if err := args.PageSize.Positive(); err != nil {
		return NewInvalidArgumentError(err).InField("pageSize")
	}
	if err := args.Page.Positive(); err != nil {
		return NewInvalidArgumentError(err).InField("page")
	}
	return nil
}
