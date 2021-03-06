'use babel'

export default `div(class="section-container user-support-helper")
  div.container
    div(class="row content")
  div.section-footer
    span
      input(class="confirm" type="checkbox")
      span!= words.confirm
    button(class="pull-right btn btn menu-btn tip-close") !{words.close}
    button(class="pull-right btn btn menu-btn tip-next") !{words.next}
    button(class="pull-right btn btn menu-btn tip-previous") !{words.previous}
`
