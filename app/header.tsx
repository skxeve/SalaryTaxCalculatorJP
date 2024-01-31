import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'

export default function Header() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
          給与収入と税金のシミュレーター
      </Typography>
      <Typography variant="h5" gutterBottom>
        本ツールについて
      </Typography>
      <Typography variant="body2" gutterBottom>
        給与収入と各種税金のシミュレーション用ツールです。<br />
      </Typography>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDown />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="body1" gutterBottom>
            注意事項
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" gutterBottom>
            本ツールの利用に伴って何かしらの不利益が発生したとしても当方では責任を負いかねます。ご利用は自己責任でお願いします。<br />
            わかりやすさやツール制作速度を優先したため、各種名称は税法などに基づいた正式なものではない可能性があります。<br />
            バグ修正や未対応の項目に対応して欲しい場合は、PRを歓迎しています。<br />
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDown />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="body1" gutterBottom>
            把握している範囲の未対応項目など
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" gutterBottom>
            損失の繰越控除を考慮できていません。<br />
            給与所得控除額について、額面年収660万円未満の場合に使用する「年末調整等のための給与所得控除後の給与等の金額の表」に対応しておらず、計算式で求めているため本来の数値と多少のズレが発生しています。<br />
            社会保険料について年収を元に概算を出していますが、実際の値とはズレが生じやすいため正確性を上げたい場合は社会保険料控除額の上書きを利用してください。<br />
            住民税は所得に応じて決まりますが、実際の支払いタイミングは翌年6月から翌々年5月までとなります。<br />
            所得控除のうち、配偶者特別控除、扶養控除、勤労学生控除、寡婦控除、ひとり親控除、障害者控除、小規模企業共済等掛金控除、セルフメデュケーション税制、雑損控除、生命保険料控除の旧契約、地震保険料控除の旧長期損害保険料に対応していません。<br />
            税額控除については、住宅ローン控除（住宅借入金等特別控除）とふるさと納税のみに対応しており、配当控除、外国税額控除、調整控除（住民税）には対応していません。<br />
            一定の所得を下回る場合などで住民税が非課税になる条件には対応していません。<br />
            ふるさと納税の控除額計算式に用いる所得税率について、所得税側で税額控除が発生した場合の影響がわからなかったため、復興特別所得税を考慮しない計算となっています。<br />
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}
