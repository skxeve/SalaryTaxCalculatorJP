'use client'
import React, { useState } from 'react'
import { TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Switch, FormControlLabel } from '@mui/material'
import { Pie } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

import incomeTaxRates from './data/income-tax-rates.json'
import incomeCostRates from './data/income-cost-rates.json'
import incomeTaxBaseDeductions from './data/income-tax-base-deduction.json'
import municipalTaxBaseDeductions from './data/municipal-tax-base-deduction.json'
import incomeTaxSpouseDeductions from './data/income-tax-spouse-deduction.json'
import incomeTaxElderlySpouseDeductions from './data/income-tax-elderly-spouse-deduction.json'
import municipalTaxSpouseDeductions from './data/municipal-tax-spouse-deduction.json'
import municipalTaxElderlySpouseDeductions from './data/municipal-tax-elderly-spouse-deduction.json'
import standardMonthlySalaryLevels from './data/standard-monthly-salary-levels.json'


const CalculationBody: React.FC = () => {
  // 給与収入、収入、総支給額。初期値は日本全体の中央値
  const [annualIncome, setAnnualIncome] = useState<number>(4370000)
  // 確定拠出年金への拠出額。初期値は最大値5.5万円*12ヶ月分
  const [annual401k, setAnnual401k] = useState<number>(660000)
  const [monthlyCommutingExpenses, setMonthlyCommutingExpenses] = useState<number>(0)
  const [age, setAge] = useState<number>(30)
  const [healthInsuranceRate, setHealthInsuranceRate] = useState<number>(8.5)
  const [careInsuranceRate, setCareInsuranceRate] = useState<number>(2)
  const [healthPensionRate, setHealthPensionRate] = useState<number>(18.3)
  const [employmentInsuranceWorkerRate, setEmploymentInsuranceWorkerRate] = useState<number>(0.6)
  const [employmentInsuranceCompanyRate, setEmploymentInsuranceCompanyRate] = useState<number>(0.95)
  const [accidentInsuranceRate, setAccidentInsuranceRate] = useState<number>(0.3)
  const [overwriteSocialTax, setOverwriteSocialTax] = useState<number>(0)

  const [spouseAge, setSpouseAge] = useState<number>(30)
  const [spouseIncome, setSpouseIncome] = useState<number>(0)
  const [lifeBasicInsurancePaid, setLifeBasicInsurancePaid] = useState<number>(0)
  const [lifeMedicalInsurancePaid, setLifeMedicalInsurancePaid] = useState<number>(0)
  const [lifePensionInsurancePaid, setLifePensionInsurancePaid] = useState<number>(0)
  const [earthquakeInsurancePaid, setEarthquakeInsurancePaid] = useState<number>(0)
  const [donationPaid, setDonationPaid] = useState<number>(0)
  const [medicalPaid, setMedicalPaid] = useState<number>(0)
  const [otherTaxableDeduction, setOtherTaxableDeduction] = useState<number>(0)

  const [housingLoanSpecialDeduction, setHousingLoanSpecialDeduction] = useState<number>(0)
  const [housingLoanTransfer7Flag, setHousingLoanTransfer7Flag] = useState<boolean>(true)

  const [hometownTax, setHometownTax] = useState<number>(0)
  const [hometownOnestopFlag, setHometownOnestopFlag] = useState<boolean>(true)

  const [otherTax, setOtherTax] = useState<number>(0)

  const calcAnnualCosts = (ai: number): number => {
    const [rate, deduction] = getCostRateAndDeduction(ai)
    return Math.floor(ai * rate / 100) - deduction
  }
  const getStandardMonthlySalaryLevel = (i: number): {level: number, pLevel: number, salary: number, pSalary: number} => {
    let res = {level: 1, pLevel: 1, salary: 0, pSalary: 0}
    for (const s of standardMonthlySalaryLevels) {
      if (i < s.under || (s.over != null && i >= s.over)) {
        if (res.salary === 0) {
          res.level = s.level
          res.salary = s.salary
        }
        if (s.pLevel > 0) {
          res.pLevel = s.pLevel
          res.pSalary = s.salary
        }
      } else if (s.pLevel === 32 && res.pSalary === 0) {
        res.pLevel = s.pLevel
        res.pSalary = s.salary
      }
      if (res.salary !== 0 && res.pSalary !== 0) {
        return res
      }
    }
    return res
  }
  const getCostRateAndDeduction = (i: number): [number, number] => {
    for (const taxRate of incomeCostRates) {
      if (i < taxRate.income || taxRate.income === 0) {
        return [taxRate.rate, taxRate.deduction]
      }
    }
    console.error("Not found costRate data.", i, incomeTaxRates)
    return [0, -1950000]
  }

  const getIncomeTaxRateAndDeduction = (i: number): [number, number] => {
    for (const taxRate of incomeTaxRates) {
      if (i < taxRate.income || taxRate.income === 0) {
        return [taxRate.rate, taxRate.deduction]
      }
    }
    console.error("Not found incomeRate data.", i, incomeTaxRates)
    return [45, 4796000]
  }

  const getBaseDeduction = (deductions: {annualIncome: number, deduction: number}[], ai: number): number => {
    for (const data of deductions) {
      if (ai <= data.annualIncome || data.annualIncome === 0) {
        return data.deduction
      }
    }
    console.error("Not found baseDeduction data.", deductions, ai)
    return 0
  }

  const calcSpouseDeduction = (se: boolean, ai: number, si: number, sa: number, isMunicipal: boolean): number => {
    if (!se || si > 10000000) return 0
    if (si < 480000) {
      // 配偶者控除
      if (sa < 70) {
        return getBaseDeduction(isMunicipal ? municipalTaxSpouseDeductions : incomeTaxSpouseDeductions, ai)
      } else {
        return getBaseDeduction(isMunicipal ? municipalTaxElderlySpouseDeductions : incomeTaxElderlySpouseDeductions, ai)
      }
    } else {
      // TODO: 配偶者特別控除
      return 0
    }
  }

  // 医療費控除
  const calcMedicalDeduction = (ai: number, mp: number): number => {
    return Math.max(Math.min(mp - Math.min(Math.floor(ai * 0.05), 100000), 2000000), 0)
  }

  // 生命保険料控除
  const calcOneLifeInsuranceDeduction = (n: number, isMunicipal: boolean): number => {
    if (n <= 12000) return n
    if (n <= 20000) {
      if (isMunicipal) return Math.ceil(n / 2) + 6000; else return n
    }
    if (n <= 32000) {
      if (isMunicipal) return Math.ceil(n / 2) + 6000; else return Math.ceil(n / 2) + 10000
    }
    if (n <= 40000) {
      if (isMunicipal) return Math.ceil(n / 4) + 14000; else return Math.ceil(n / 2) + 10000
    }
    if (n <= 56000) {
      if (isMunicipal) return Math.ceil(n / 4) + 14000; else return Math.ceil(n / 4) + 20000
    }
    if (n <= 80000) {
      if (isMunicipal) return 28000; else return Math.ceil(n / 4) + 20000
    }
    if (isMunicipal) return 28000; else return 40000
  }
  const calcLifeInsuranceDeduction = (b: number, m: number, p: number, isMunicipal: boolean): number => {
    return Math.max(Math.min(calcOneLifeInsuranceDeduction(b, isMunicipal) + calcOneLifeInsuranceDeduction(m, isMunicipal) + calcOneLifeInsuranceDeduction(p, isMunicipal), isMunicipal ? 70000 : 120000), 0)
  }

  // 寄附金控除(所得控除)
  const calcDonationDeduction = (dp: number, ai: number): number => {
    return Math.max(Math.min(dp - 2000, Math.floor(ai * 0.4)), 0)
  }

  // 必要経費、所得控除
  const annualCosts = calcAnnualCosts(annualIncome)
  // 所得金額
  const netIncome = Math.max(annualIncome - annualCosts, 0)

  function createCommonData(
    name: string,
    desc: string,
    yen: number,
  ) {
    return { name, desc, yen }
  }

  const commonRows = [
    createCommonData('額面年収', '給与収入に企業型DCで引かれている額を加算した、転職の際などに申告するべき年収額', annualIncome + annual401k),
    createCommonData('給与収入', '収入や総支給額、源泉徴収票における「支払金額」', annualIncome),
    createCommonData('給与所得控除', '必要経費や所得控除とも言う', annualCosts),
    createCommonData('所得金額', '給与収入 - 給与所得控除。源泉徴収票における「給与所得控除後の金額」', netIncome),
  ]

  // 交通費を含めた報酬総額
  const amountIncome = annualIncome + (monthlyCommutingExpenses * 12)
  // 等級
  const standardMonthlySalaryLevel = getStandardMonthlySalaryLevel(Math.floor(amountIncome / 12))
  // 健康保険料（折半）
  const healthInsuranceCost = Math.floor(standardMonthlySalaryLevel.salary * healthInsuranceRate / 100 / 2)
  // 介護保険料（折半）
  const careInsuranceCost = age >= 40 ? Math.round(standardMonthlySalaryLevel.salary * careInsuranceRate / 100 / 2) : 0
  // 厚生年金保険料（折半）
  const healthPensionCost = Math.floor(standardMonthlySalaryLevel.pSalary * healthPensionRate / 100 / 2)
  // 雇用保険料（自己負担）
  const employmentInsuranceWorkerCost = Math.round(amountIncome * employmentInsuranceWorkerRate / 100)
  // 雇用保険料（使用者負担）
  const employmentInsuranceCompanyCost = Math.round(amountIncome * employmentInsuranceCompanyRate / 100)
  // 労災保険料（全額使用者負担）
  const accidentInsuranceCost = Math.round(amountIncome * accidentInsuranceRate / 100)
  // 社会保険料トータル税率
  const totalSocialTaxRate = healthInsuranceRate + (age >= 40 ? careInsuranceRate : 0) + healthPensionRate + employmentInsuranceWorkerRate + employmentInsuranceCompanyRate + accidentInsuranceRate
  // 社会保険料基準の人件費率
  const employeeCostRate = 100 + (healthInsuranceRate + (age >= 40 ? careInsuranceRate : 0) + healthPensionRate) / 2 + employmentInsuranceCompanyRate + accidentInsuranceRate
  // 実質社会保険税率
  const essentialSocialTaxRate = Math.floor((totalSocialTaxRate / employeeCostRate) * 1000) / 10

  function createSocialData(
    name: string,
    desc: string,
    standard: number,
    rate: number,
    yen: number,
  ) {
    return { name, desc, standard, rate, yen }
  }

  const socialRows = [
    createSocialData('健康保険料', '標準報酬月額に税率を掛けて事業者と折半した額（' + standardMonthlySalaryLevel.level + '等級）', standardMonthlySalaryLevel.salary, healthInsuranceRate, healthInsuranceCost),
    createSocialData('介護保険料', '40歳以上の場合、標準報酬月額に税率を掛けて事業者と折半した額', standardMonthlySalaryLevel.salary, careInsuranceRate, careInsuranceCost),
    createSocialData('厚生年金保険料', '標準報酬月額に税率を掛けて事業者と折半した額', standardMonthlySalaryLevel.pSalary, healthPensionRate, healthPensionCost),
    createSocialData('雇用保険料', '額面収入に税率を掛けた労働者負担額', Math.floor(amountIncome / 12), employmentInsuranceWorkerRate + employmentInsuranceCompanyRate, Math.floor(employmentInsuranceWorkerCost / 12)),
    createSocialData('労災保険料', '額面収入に税率を掛ける、全額使用者負担の社会保険料', Math.floor(amountIncome / 12), accidentInsuranceRate, 0),
  ]

  // 基礎控除(所得税)
  const incomeTaxBaseDeduction = getBaseDeduction(incomeTaxBaseDeductions, annualIncome)
  // 基礎控除(住民税)
  const municipalTaxBaseDeduction = getBaseDeduction(municipalTaxBaseDeductions, annualIncome)
  // 配偶者控除(所得税)
  const incomeTaxSpouseDeduction = calcSpouseDeduction(spouseAge > 0, annualIncome, spouseIncome, spouseAge, false)
  // 配偶者控除(住民税)
  const municipalTaxSpouseDeduction = calcSpouseDeduction(spouseAge > 0, annualIncome, spouseIncome, spouseAge, true)

  // 社会保険料控除
  const socialInsuranceDeduction = overwriteSocialTax > 0 ? overwriteSocialTax : (healthInsuranceCost + careInsuranceCost + healthPensionCost) * 12 + employmentInsuranceWorkerCost

  // 生命保険料控除(所得税)
  const incomeTaxLifeInsuranceDeduction = calcLifeInsuranceDeduction(lifeBasicInsurancePaid, lifeMedicalInsurancePaid, lifePensionInsurancePaid, false)
  // 生命保険料控除(住民税)
  const municipalTaxLifeInsuranceDeduction = calcLifeInsuranceDeduction(lifeBasicInsurancePaid, lifeMedicalInsurancePaid, lifePensionInsurancePaid, true)

  // 地震保険料控除(所得税)
  const incomeTaxEarthquakeInsuranceDeduction = Math.min(earthquakeInsurancePaid, 50000)
  // 地震保険料控除(住民税)
  const municipalTaxEarthquakeInsuranceDeduction = Math.min(Math.ceil(earthquakeInsurancePaid / 2), 25000)

  // 医療費控除
  const medicalDeduction = calcMedicalDeduction(annualIncome, medicalPaid)
  // 寄附金控除
  const donationDeduction = calcDonationDeduction(donationPaid, annualIncome)


  // 所得控除(所得税)
  const incomeTaxableIncomeDeduction = incomeTaxBaseDeduction + incomeTaxSpouseDeduction + socialInsuranceDeduction + incomeTaxLifeInsuranceDeduction + incomeTaxEarthquakeInsuranceDeduction + medicalDeduction + otherTaxableDeduction
  // 所得控除(住民税)
  const municipalTaxableIncomeDeduction = municipalTaxBaseDeduction + municipalTaxSpouseDeduction + socialInsuranceDeduction + incomeTaxLifeInsuranceDeduction + incomeTaxEarthquakeInsuranceDeduction + medicalDeduction + donationDeduction + otherTaxableDeduction
  // 課税所得(所得税,1000円未満切り捨て)
  const incomeTaxableIncome = Math.floor(Math.max(netIncome - incomeTaxableIncomeDeduction, 0) / 1000) * 1000
  // 課税所得(住民税)
  const municipalTaxableIncome = Math.max(netIncome - municipalTaxableIncomeDeduction, 0)
  // 税率と控除額(所得税)
  const [incomeTaxRate, incomeTaxDefaultDeduction] = getIncomeTaxRateAndDeduction(incomeTaxableIncome)
  // 税率と控除額(住民税)
  const [municipalTaxRate, municipalTaxDefaultDeduction] = [10, 0]
  // 復興特別所得税
  const specialIncomeTaxRate = 2.1

  // 所得税
  const incomeTaxDefault = Math.floor(incomeTaxableIncome * incomeTaxRate / 100) - incomeTaxDefaultDeduction
  // ふるさと納税A
  const hometownDeductionA = Math.max(Math.min(Math.floor((hometownTax - 2000) * incomeTaxRate / 100), Math.floor(netIncome * 0.4)), 0)
  // ふるさと納税B
  const hometownDeductionB = Math.max(Math.min(Math.floor((hometownTax - 2000) * 0.1), Math.floor(netIncome * 0.3)), 0)
  // ふるさと納税Aを控除（確定申告する場合）
  const incomeTaxAfterHD = incomeTaxDefault - (hometownOnestopFlag ? 0 : hometownDeductionA)
  // 住宅ローン控除
  const housingLoanApplyDeduction = Math.min(housingLoanSpecialDeduction, incomeTaxAfterHD)
  const housingLoanSurplusDeduction = housingLoanSpecialDeduction - housingLoanApplyDeduction
  const incomeTaxProvision = incomeTaxAfterHD - housingLoanApplyDeduction
  const incomeTax = Math.floor(incomeTaxProvision * (100 + specialIncomeTaxRate) / 100)
  // 住民税(所得割)
  const municipalRatedTaxDefault = Math.floor(municipalTaxableIncome * municipalTaxRate / 100) - municipalTaxDefaultDeduction

  // ふるさと納税C
  const hometownDeductionC = Math.max(Math.min(Math.floor((hometownTax - 2000) * (90 - incomeTaxRate) / 100), Math.floor(municipalRatedTaxDefault * 0.2)), 0)
  // ふるさと納税Cの計算式からふるさと納税の最大効率額を算出
  const hometownTaxMax = Math.floor(municipalRatedTaxDefault * 0.2 / ((90 - incomeTaxRate) / 100)) + 2000

  // ふるさと納税控除
  const municipalRatedTaxAfterHD = municipalRatedTaxDefault - (hometownOnestopFlag ? hometownDeductionA : 0) - hometownDeductionB - hometownDeductionC

  // 繰越住宅ローン控除繰越
  const municipalHLDRate = housingLoanTransfer7Flag ? 7 : 5
  const municipalHLDMax = housingLoanTransfer7Flag ? 136500 : 97500
  const municipalHLDCan = Math.min(housingLoanSurplusDeduction, Math.floor(incomeTaxableIncome * municipalHLDRate / 100), municipalHLDMax)
  const municipalHousingLoanApplyDeduction = Math.min(municipalRatedTaxDefault, municipalHLDCan)
  const municipalHousingLoanSurplusDeduction = housingLoanSurplusDeduction - municipalHousingLoanApplyDeduction
  const municipalRatedTax = municipalRatedTaxAfterHD - municipalHousingLoanApplyDeduction
  // 住民税(均等割)
  const municipalFixedTax = 5000
  // 住民税(合計)
  const municipalTax = municipalRatedTax + municipalFixedTax

  // 手取り
  const spendableIncome = annualIncome - (socialInsuranceDeduction + incomeTax + municipalTax + otherTax)
  // 手取りの消費税分
  const spendableVat = Math.floor(spendableIncome * 10 / 110)
  // 可処分金額（税抜）
  const spendableRawMoney = spendableIncome - spendableVat

  function createTaxData(
    name: string,
    desc: string,
    incomeTax: number,
    municipalTax: number,
  ) {
    return { name, desc, incomeTax, municipalTax }
  }

  const tax1stRows = [
    createTaxData('基礎控除', '給与収入に応じて決まる、本人の最低限度の生活を維持するのに必要とされる控除額', incomeTaxBaseDeduction, municipalTaxBaseDeduction),
    createTaxData('配偶者控除', '本人と配偶者の給与収入に応じて決まる、本人の最低限度の生活を維持するのに必要とされる控除額', incomeTaxSpouseDeduction, municipalTaxSpouseDeduction),
    createTaxData('社会保険料控除', '1年間に支払った社会保険料（国民年金保険料、厚生年金保険料、雇用保険料、健康保険料、介護保険料）の全額が控除される', socialInsuranceDeduction, socialInsuranceDeduction),
    createTaxData('生命保険料控除', '一定の条件を備えた生命保険契約等に係る保険料または掛金を支払った場合、契約者配当金等を控除した正味払込保険料を控除対象として所定の計算式に当てはめた結果が控除される（上限12万円/7万円）', incomeTaxLifeInsuranceDeduction, municipalTaxLifeInsuranceDeduction),
    createTaxData('地震保険料控除', '地震等損害に対する保険をかけるために保険料・掛金を支払った場合、契約者配当金等を控除した正味払込保険料を控除対象として所定の計算式に当てはめた結果が控除される（上限5万円/2.5万円）', incomeTaxEarthquakeInsuranceDeduction, municipalTaxEarthquakeInsuranceDeduction),
    createTaxData('寄付金控除', '個人が国や地方公共団体、社会福祉法人、一定の認定NPO法人などに対し寄付をした場合に認められる所得税の所得控除', donationDeduction, 0),
    createTaxData('医療費控除', '自分自身や家族のために医療費を支払った場合に適用となる控除（上限200万円）', medicalDeduction, medicalDeduction),
    createTaxData('その他の所得控除', '本ツールで未対応のため直接入力した所得控除額', otherTaxableDeduction, otherTaxableDeduction),
    createTaxData('所得控除', '所得控除額の合計', incomeTaxableIncomeDeduction, municipalTaxableIncomeDeduction),
    createTaxData('課税所得', '所得金額から所得控除を引いた、課税の基準となる所得額', incomeTaxableIncome, municipalTaxableIncome),
    createTaxData('税率(%)', '課税所得に応じた累進となる', incomeTaxRate, municipalTaxRate),
    createTaxData('標準控除額', '課税所得に応じた累進で逆転現象が起きないようにする標準税額控除', incomeTaxDefaultDeduction, municipalTaxDefaultDeduction),
    createTaxData('暫定税額', '課税所得に税率を掛けて標準控除額のみを税額控除した、税額控除前の暫定税額', incomeTaxDefault, municipalRatedTaxDefault),
  ]
  const tax2ndRows = [
    createTaxData('ふるさと納税（所得税からの控除）', '総所得金額等の40％（' + Math.floor(netIncome * 0.4).toLocaleString() + '円）を上限として［（ふるさと納税額－2,000円）×「所得税の税率」］が控除される', hometownOnestopFlag ? 0 : hometownDeductionA, hometownOnestopFlag ? hometownDeductionA : 0),
    createTaxData('ふるさと納税（住民税からの基本分控除）', '総所得金額等の30％（' + Math.floor(netIncome * 0.3).toLocaleString() + '円）を上限として［（ふるさと納税額－2,000円）×10%］が控除される', 0, hometownDeductionB),
    createTaxData('ふるさと納税（住民税からの特例分控除）', '住民税所得割額の20％（' + Math.floor(municipalRatedTaxDefault * 0.2).toLocaleString() + '円）を上限として［（ふるさと納税額 - 2,000円）×（100％ - 10％（基本分） - 所得税の税率）］が控除される', 0, hometownDeductionC),
    createTaxData('ふるさと納税（控除合計額）', '3種類の控除額の合計を住民税側に表示しています。', 0, hometownDeductionA + hometownDeductionB + hometownDeductionC),
    createTaxData('住宅ローン控除可能額', '住宅ローン控除できる全額', housingLoanSpecialDeduction, municipalHLDCan),
    createTaxData('住宅ローン控除実施額', '実際に控除に使用する額', housingLoanApplyDeduction, municipalHousingLoanApplyDeduction),
    createTaxData('住宅ローン控除余剰額', '控除し切れなかった控除額', housingLoanSurplusDeduction, municipalHousingLoanSurplusDeduction),
    createTaxData('税額控除後の税額', '暫定税額から税額控除を差し引いた後の税額', incomeTaxProvision, municipalRatedTax),
    createTaxData('特別税率(%)', '復興特別所得税など', specialIncomeTaxRate, 0),
    createTaxData('均等割', '所得に関係なく定額で定められた税額', 0, municipalFixedTax),
    createTaxData('納税額', '最終的に納める額', incomeTax, municipalTax),
    createTaxData('納税額(月割)', '最終的に納める額(上記の1/12)', Math.floor(incomeTax / 12), Math.floor(municipalTax / 12)),
  ]

  const chartData = {
    labels: [
      '可処分所得(税抜)',
      '可処分所得(消費税10%分)',
      '厚生年金保険料',
      '健康保険料',
      '介護保険料',
      '雇用保険料',
      '労災保険料',
      '所得税',
      '住民税',
      'その他の税',
      '確定拠出年金',
    ],
    datasets: [
      {
        data: [
          spendableRawMoney,
          spendableVat,
          healthPensionCost * 12 * 2,
          healthInsuranceCost * 12 * 2,
          careInsuranceCost * 12 * 2,
          employmentInsuranceWorkerCost + employmentInsuranceCompanyCost,
          accidentInsuranceCost,
          incomeTax,
          municipalTax,
          otherTax,
          annual401k,
        ],
      },
    ],
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <Typography variant="h5" gutterBottom>
        必要項目の入力
      </Typography>

      <Typography variant="h6" gutterBottom>
          基本情報
      </Typography>
      <div>
        <TextField
          label="給与収入（源泉徴収票の支払金額）"
          type="number"
          value={annualIncome}
          onChange={(e) => setAnnualIncome(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="確定拠出年金拠出額（年間）"
          type="number"
          value={annual401k}
          onChange={(e) => setAnnual401k(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <Tooltip title="介護保険料の有無に影響">
          <TextField
            label="年齢"
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
        </Tooltip>
        <TextField
          label="通勤手当（月額）"
          type="number"
          value={monthlyCommutingExpenses}
          onChange={(e) => setMonthlyCommutingExpenses(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="配偶者の年齢（いない場合は0）"
          type="number"
          value={spouseAge}
          onChange={(e) => setSpouseAge(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        {spouseAge > 0 && <TextField
          label="配偶者の給与収入"
          type="number"
          value={spouseIncome}
          onChange={(e) => setSpouseIncome(Number(e.target.value))}
          fullWidth
          margin="normal"
        />}

        <Typography variant="h6" gutterBottom>
          社会保険料
        </Typography>
        <TextField
          label="健康保険料率"
          type="number"
          value={healthInsuranceRate}
          onChange={(e) => setHealthInsuranceRate(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="介護保険料率"
          type="number"
          value={careInsuranceRate}
          onChange={(e) => setCareInsuranceRate(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="厚生年金料率"
          type="number"
          value={healthPensionRate}
          onChange={(e) => setHealthPensionRate(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="雇用保険料率（従業員負担）"
          type="number"
          value={employmentInsuranceWorkerRate}
          onChange={(e) => setEmploymentInsuranceWorkerRate(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="雇用保険料率（使用者負担）"
          type="number"
          value={employmentInsuranceCompanyRate}
          onChange={(e) => setEmploymentInsuranceCompanyRate(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="労災保険料率"
          type="number"
          value={accidentInsuranceRate}
          onChange={(e) => setAccidentInsuranceRate(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="社会保険料（1以上の場合に上書き）"
          type="number"
          value={overwriteSocialTax}
          onChange={(e) => setOverwriteSocialTax(Number(e.target.value))}
          fullWidth
          margin="normal"
        />

        <Typography variant="h6" gutterBottom>
          控除額
        </Typography>
        <TextField
          label="生命保険料（一般申告額）"
          type="number"
          value={lifeBasicInsurancePaid}
          onChange={(e) => setLifeBasicInsurancePaid(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="生命保険料（介護医療申告額）"
          type="number"
          value={lifeMedicalInsurancePaid}
          onChange={(e) => setLifeMedicalInsurancePaid(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="生命保険料（個人年金申告額）"
          type="number"
          value={lifePensionInsurancePaid}
          onChange={(e) => setLifePensionInsurancePaid(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="地震保険料"
          type="number"
          value={earthquakeInsurancePaid}
          onChange={(e) => setEarthquakeInsurancePaid(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="年間医療費から各種保険（健康保険、医療保険、生命保険、出産育児一時金など）で補填された分を引いた額"
          type="number"
          value={medicalPaid}
          onChange={(e) => setMedicalPaid(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="寄付金額"
          type="number"
          value={donationPaid}
          onChange={(e) => setDonationPaid(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="その他の所得控除額（未対応の項目用）"
          type="number"
          value={otherTaxableDeduction}
          onChange={(e) => setOtherTaxableDeduction(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="住宅借入金等特別控除額"
          type="number"
          value={housingLoanSpecialDeduction}
          onChange={(e) => setHousingLoanSpecialDeduction(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        {housingLoanSpecialDeduction > 0 && <FormControlLabel
          control={<Switch defaultChecked onChange={() => setHousingLoanTransfer7Flag(!housingLoanTransfer7Flag)} />}
          label="2014年4月から2021年12月（特別特例取得などに該当するなら2022年12月）までに入居し、対象住宅の取得にかかった消費税の税率が8％または10％"
        />}
        <TextField
          label={'ふるさと納税額（推定最大効率' + hometownTaxMax.toLocaleString() + '円）'}
          type="number"
          value={hometownTax}
          onChange={(e) => setHometownTax(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={<Switch defaultChecked onChange={() => setHometownOnestopFlag(!hometownOnestopFlag)} />}
          label="ワンストップ特例"
        />

        <Typography variant="h6" gutterBottom>
          その他
        </Typography>
        <Tooltip title="額面年収の内訳グラフ表記のみに利用">
          <TextField
            label="その他の税額（固定資産税など）"
            type="number"
            value={otherTax}
            onChange={(e) => setOtherTax(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
        </Tooltip>
      </div>

      <div style={{ marginTop: '40px' }}>
        <Typography variant="h5" gutterBottom>
          所得と税金に関する各種数値
        </Typography>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Typography variant="h6" gutterBottom>
          基礎的な収入
        </Typography>
      </div>

      <div style={{ marginTop: '20px' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>項目</TableCell>
                <TableCell align="right">円</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commonRows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Tooltip title={row.desc}>
                      <div>{row.name}</div>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{row.yen.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div style={{ marginTop: '40px' }}>
        <Tooltip title={"実質社会保険税率" + essentialSocialTaxRate + "%"}>
          <Typography variant="h6" gutterBottom>
          社会保険料（月額）
          </Typography>
        </Tooltip>
      </div>

      <div style={{ marginTop: '20px' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>項目</TableCell>
                <TableCell align="right">標準報酬月額</TableCell>
                <TableCell align="right">税率</TableCell>
                <TableCell align="right">従業員負担分（円）</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {socialRows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Tooltip title={row.desc}>
                      <div>{row.name}</div>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{row.standard.toLocaleString()}</TableCell>
                  <TableCell align="right">{row.rate.toLocaleString()}%</TableCell>
                  <TableCell align="right">{row.yen.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div style={{ marginTop: '40px' }}>
        <Typography variant="h6" gutterBottom>
          所得控除と暫定税額の算出
        </Typography>
      </div>

      <div style={{ marginTop: '20px' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>項目</TableCell>
                <TableCell align="right">所得税</TableCell>
                <TableCell align="right">住民税</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tax1stRows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Tooltip title={row.desc}>
                      <div>{row.name}</div>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{row.incomeTax.toLocaleString()}</TableCell>
                  <TableCell align="right">{row.municipalTax.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div style={{ marginTop: '40px' }}>
        <Typography variant="h6" gutterBottom>
          税額控除と最終的に支払う税額の算出
        </Typography>
      </div>

      <div style={{ marginTop: '20px' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>項目</TableCell>
                <TableCell align="right">所得税</TableCell>
                <TableCell align="right">住民税</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tax2ndRows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Tooltip title={row.desc}>
                      <div>{row.name}</div>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{row.incomeTax.toLocaleString()}</TableCell>
                  <TableCell align="right">{row.municipalTax.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div style={{ marginTop: '40px' }}>
        <Tooltip title="社会保険料の会社負担分を含めています">
          <Typography variant="h5" gutterBottom>
            人件費の内訳
          </Typography>
        </Tooltip>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Pie data={chartData} />
      </div>
    </div>
  )
}

export default CalculationBody
