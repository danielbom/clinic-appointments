package usecase

import (
	"math/big"
	"time"

	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type PrepareInvoiceArgs struct {
	SpecialistIdRaw string
	SpecialistId    pgtype.UUID
	StartDateRaw    string
	StartDate       pgtype.Date
	EndDateRaw      string
	EndDate         pgtype.Date
}

func (args *PrepareInvoiceArgs) Validate() *UsecaseError {
	if err := args.SpecialistId.Scan(args.SpecialistIdRaw); err != nil {
		return NewInvalidArgumentError(ACTION_QUERY, "specialistId", ErrInvalidUuid)
	}
	if err := args.StartDate.Scan(args.StartDateRaw); err != nil {
		return NewInvalidArgumentError(ACTION_QUERY, "startDate", ErrInvalidDate)
	}
	if err := args.EndDate.Scan(args.EndDateRaw); err != nil {
		return NewInvalidArgumentError(ACTION_QUERY, "endDate", ErrInvalidDate)
	}
	return nil
}

func PrepareInvoice(state State, args PrepareInvoiceArgs) (InvoicePreview, *UsecaseError) {
	var preview InvoicePreview

	specialist, err := state.Queries().GetSpecialistByID(state.Context(), args.SpecialistId)
	if ErrorIsNoRows(err) {
		return preview, NewNotFoundError("specialist")
	}
	preview.Specialist.Name = specialist.Name
	preview.Specialist.Email = specialist.Email
	preview.Specialist.Phone = specialist.Phone
	preview.Specialist.Cnpj = specialist.Cnpj.String

	preview.BillingPeriod.StartDate = args.StartDate.Time.Format(time.DateOnly)
	preview.BillingPeriod.EndDate = args.EndDate.Time.Format(time.DateOnly)

	appointments, err := state.Queries().ListAppointmentsRealized(state.Context(), infra.ListAppointmentsRealizedParams{
		SpecialistId: specialist.ID,
		StartDate:    args.StartDate,
		EndDate:      args.EndDate,
	})

	items := make([]InvoiceItemCalc, 0, len(appointments))
	preview.Items = make([]InvoiceItem, 0, len(appointments))
	for index, appointment := range appointments {

		chargedAmount := big.NewRat(int64(appointment.Price), 100)
		discountAmount := big.NewRat(0, 1)
		taxRate := big.NewRat(10, 100)

		// grossAmount = chargedAmount - discountAmount
		grossAmount := new(big.Rat).Sub(chargedAmount, discountAmount)

		// taxAmount = grossAmount * taxRate / (1 + taxRate)
		onePlusTax := new(big.Rat).Add(big.NewRat(1, 1), taxRate)
		taxNumerator := new(big.Rat).Mul(grossAmount, taxRate)
		taxAmount := new(big.Rat).Quo(taxNumerator, onePlusTax)

		// netAmount = grossAmount - taxAmount
		netAmount := new(big.Rat).Sub(grossAmount, taxAmount)

		item := InvoiceItemCalc{
			index:          index,
			chargedAmount:  chargedAmount,
			grossAmount:    grossAmount,
			discountAmount: discountAmount,
			taxAmount:      taxAmount,
			netAmount:      netAmount,
		}
		items = append(items, item)
	}

	preview.Items = make([]InvoiceItem, 0, len(appointments))
	for index, appointment := range appointments {
		itemCalc := items[index]
		item := InvoiceItem{
			Type:           "APPOINTMENT",
			Description:    appointment.ServiceName + " às " + TimeToString(appointment.Time) + " do dia " + appointment.Date.Time.Format(time.DateOnly),
			Note:           "Serviço realizado para o cliente " + appointment.CustomerName,
			Quantity:       1,
			UnitAmount:     itemCalc.chargedAmount.FloatString(2),
			ChargedAmount:  itemCalc.chargedAmount.FloatString(2),
			GrossAmount:    itemCalc.grossAmount.FloatString(2),
			DiscountAmount: itemCalc.discountAmount.FloatString(2),
			TaxAmount:      itemCalc.taxAmount.FloatString(2),
			NetAmount:      itemCalc.netAmount.FloatString(2),
		}
		preview.Items = append(preview.Items, item)
	}

	var total InvoiceItemCalc
	total.chargedAmount = new(big.Rat)
	total.grossAmount = new(big.Rat)
	total.netAmount = new(big.Rat)
	total.taxAmount = new(big.Rat)
	total.discountAmount = new(big.Rat)
	preview.Count = make(map[string]int32)
	for index, item := range preview.Items {
		itemCalc := items[index]
		total.chargedAmount.Add(total.chargedAmount, itemCalc.chargedAmount)
		total.grossAmount.Add(total.grossAmount, itemCalc.grossAmount)
		total.netAmount.Add(total.netAmount, itemCalc.netAmount)
		total.taxAmount.Add(total.taxAmount, itemCalc.taxAmount)
		total.discountAmount.Add(total.discountAmount, itemCalc.discountAmount)
		preview.Count[item.Type] += 1
	}

	preview.Total.ChargedAmount = total.chargedAmount.FloatString(2)
	preview.Total.GrossAmount = total.grossAmount.FloatString(2)
	preview.Total.NetAmount = total.netAmount.FloatString(2)
	preview.Total.TaxAmount = total.taxAmount.FloatString(2)
	preview.Total.DiscountAmount = total.discountAmount.FloatString(2)

	return preview, nil
}

type InvoiceItemCalc struct {
	index          int
	chargedAmount  *big.Rat
	grossAmount    *big.Rat
	netAmount      *big.Rat
	taxAmount      *big.Rat
	discountAmount *big.Rat
}

type InvoiceItem struct {
	Type           string `json:"type"`
	Description    string `json:"description"`
	Note           string `json:"note"`
	Quantity       int64  `json:"quantity"`
	UnitAmount     string `json:"unitAmount"`
	ChargedAmount  string `json:"chargedAmount"`
	GrossAmount    string `json:"grossAmount"`
	DiscountAmount string `json:"discountAmount"`
	TaxAmount      string `json:"taxAmount"`
	NetAmount      string `json:"netAmount"`
}

type InvoiceTotal struct {
	ChargedAmount  string `json:"chargedAmount"`
	GrossAmount    string `json:"grossAmount"`
	NetAmount      string `json:"netAmount"`
	TaxAmount      string `json:"taxAmount"`
	DiscountAmount string `json:"discountAmount"`
}

type InvoiceSpecialist struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Cnpj  string `json:"cnpj"`
}

type InvoiceBillingPeriod struct {
	StartDate string `json:"startDate"`
	EndDate   string `json:"endDate"`
}

type InvoicePreview struct {
	Specialist    InvoiceSpecialist    `json:"specialist"`
	Total         InvoiceTotal         `json:"total"`
	Count         map[string]int32     `json:"count"`
	BillingPeriod InvoiceBillingPeriod `json:"billingPeriod"`
	Items         []InvoiceItem        `json:"items"`
}
