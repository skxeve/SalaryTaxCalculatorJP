import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'

export default function Footer() {
  return (
    <div style={{ marginTop: '40px' }}>
      <Typography variant="h6" gutterBottom>
          参考文献
      </Typography>
      <ul>
        <li>
          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDropDown />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>
                <a target="_blank" href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm">所得税の税率(国税庁HP)</a>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                  ホーム&nbsp;&gt;&nbsp;税の情報・手続・用紙&nbsp;&gt;&nbsp;税について調べる&nbsp;&gt;&nbsp;タックスアンサー（よくある税の質問）&nbsp;&gt;&nbsp;No.2260&nbsp;所得税の税率
                <br />
                  令和5年4月1日現在法令等
              </Typography>
            </AccordionDetails>
          </Accordion>
        </li>
        <li>
          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDropDown />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>
                <a target="_blank" href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm">給与所得控除(国税庁HP)</a>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                  ホーム&nbsp;&gt;&nbsp;税の情報・手続・用紙&nbsp;&gt;&nbsp;税について調べる&nbsp;&gt;&nbsp;タックスアンサー（よくある税の質問）&nbsp;gt;&nbsp;No.1410&nbsp;給与所得控除
                <br />
                  令和5年4月1日現在法令等
              </Typography>
            </AccordionDetails>
          </Accordion>
        </li>
        <li>
          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDropDown />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>
                <a target="_blank" href="https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/furusato/mechanism/deduction.html">ふるさと納税のしくみ(総務省HP)</a>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                  ふるさと納税のしくみ &gt; ふるさと納税の概要 &gt; ふるさと納税の流れ &gt; 税金の控除について
              </Typography>
            </AccordionDetails>
          </Accordion>
        </li>
        <li>
          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDropDown />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>
                <a target="_blank" href="https://ja.wikipedia.org/wiki/%E6%89%80%E5%BE%97%E7%A8%8E">所得税(Wikipedia)</a>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                読みやすく程よく情報がまとまっているため、国のHP以外ではここが最も参考になる。<br />
              </Typography>
            </AccordionDetails>
          </Accordion>
        </li>
        <li>
          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDropDown />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>
                <a target="_blank" href="https://www.kyoukaikenpo.or.jp/g7/cat330/sb3150/r05/r5ryougakuhyou3gatukara/">厚生年金保険の等級情報(全国健康保険協会HP)</a>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                令和5年3月分の東京都のデータを参考にしています。<br />
              </Typography>
            </AccordionDetails>
          </Accordion>
        </li>
        <li>
          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDropDown />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>
                <a target="_blank" href="https://www.its-kenpo.or.jp/hoken/jimu/hokenryou/index.html">ITS健保の健康保険料(ITS健保HP)</a>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                健康保険料と介護保険料の料率（初期値）についてはこちらを参考にしています。<br />
              </Typography>
            </AccordionDetails>
          </Accordion>
        </li>
      </ul>
    </div>
  )
}
