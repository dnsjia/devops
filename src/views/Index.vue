<template>
    <a-row :gutter="16">
      <a-col :span="6">
          <a-card :loading="dashLoading" :hoverable="true" style="height: 140px">
              <div class="ant-statistic-title">应用</div>
              <div class="ant-statistic-content">
                  <span class="ant-statistic-content-value">
                      <span class="ant-statistic-content-value-int">{{ applicationCount }}</span></span>
                  <span class="ant-statistic-content-suffix">个</span></div>
          </a-card>
      </a-col>
      <a-col :span="6">
          <a-card :loading="dashLoading" :hoverable="true" style="height: 140px">
              <div class="ant-statistic-title">主机</div>
              <div class="ant-statistic-content">
                  <span class="ant-statistic-content-value">
                      <span class="ant-statistic-content-value-int">{{ virtualHostCount }}</span></span>
                  <span class="ant-statistic-content-suffix">个</span></div>
          </a-card>
      </a-col>
      <a-col :span="6">
          <a-card :loading="dashLoading" :hoverable="true" style="height: 140px">
              <div class="ant-statistic-title">工单</div>
              <div class="ant-statistic-content">
                  <span class="ant-statistic-content-value">
                      <span class="ant-statistic-content-value-int">{{ ticketCount }}</span></span>
                  <span class="ant-statistic-content-suffix">个</span></div>
          </a-card>
     <br></a-col>
      <a-col :span="6">
          <a-card :loading="dashLoading" :hoverable="true" style="height: 140px">
              <div class="ant-statistic-title">部署</div>
              <div class="ant-statistic-content">
                  <span class="ant-statistic-content-value">
                      <span class="ant-statistic-content-value-int">{{ deployCount }}</span></span>
                  <span class="ant-statistic-content-suffix">个</span></div>
          </a-card>
     <br></a-col>
        <a-col :space="2">
            <a-card :hoverable="true" :loading="oneLoading" title="一周部署情况" style="margin-top: 160px;">
                <div id="chars" style="width: 90%"></div>
            </a-card>
        </a-col>
    </a-row>




</template>

<script>
import { Chart } from '@antv/g2';
import { getCountChart, getDeployChart } from '@/api/chart'
export default {
    data(){
        return {
            data: [
              // { id:1, days: '2020-10-01', deploy_status: '部署成功', count: 7 },
              // { id:2, days: '2020-10-01', deploy_status: '部署失败', count: 2 },
              // { id:3, days: '2020-10-02', deploy_status: '部署成功', count: 6.9 },
              // { id:4, days: '2020-10-02', deploy_status: '部署失败', count: 4.2 },
              // { id:5, days: '2020-10-03', deploy_status: '部署成功', count: 9.5 },
              // { id:6, days: '2020-10-03', deploy_status: '部署失败', count: 5.7 },
              // { id:7, days: '2020-10-04', deploy_status: '部署成功', count: 14.5 },
              // { id:8, days: '2020-10-04', deploy_status: '部署失败', count: 8.5 },
              // { id:9, days: '2020-10-05', deploy_status: '部署成功', count: 18.4 },
              // { id:10, days: '2020-10-05', deploy_status: '部署失败', count: 11.9 },

            ],
            applicationCount: 0,
            ticketCount: 0,
            virtualHostCount: 0,
            deployCount: 0,
            dashLoading: true,
            oneLoading: false,
            chart: '',
        };
    },
    mounted (){
        // todo 请求图表接口赋值给data
        this.chart = new Chart({
          container: 'chars',
          autoFit: true,
          height: 400,
        });

        this.chart.data(this.data.data);
        this.chart.scale({
          days: {
            range: [0, 1],
          },
          count: {
            nice: true,
          },
        });

        this.chart.tooltip({
          showCrosshairs: true,
          shared: true,
        });


        this.chart
          .line()
          .position('days*count')
          .color('deploy_status')
          .shape('smooth');

        this.chart
          .point()
          .position('days*count')
          .color('deploy_status')
          .shape('circle');

        this.chart.render();


    },
    methods: {
        // 获取统计数据
        async getCountChart() {
            const res = await getCountChart()
            if (res.errcode===0){
                this.applicationCount = res.data.application
                this.ticketCount = res.data.ticket
                this.virtualHostCount = res.data.virtual_host
                this.deployCount = res.data.deploy
                this.dashLoading = false
            } else{
                this.$msgerror(res.msg)
            }

        },
        async getDeployChart(){
        // 请求一周部署接口
            const res = await getDeployChart()
            if (res.errcode===0) {
              //console.log(res.data, 356)
              this.data = res.data
              this.oneLoading = false
              //this.chart.changeData(this.data.data)
              // 重新渲染图表
              this.chart.data(this.data.data)
              this.chart.render();
            } else {
                this.$msgerror(res.msg)
            }

        }

    },
    created() {
        this.getCountChart()
        this.getDeployChart()
    }
}
</script>
<style scoped>

</style>